import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Prompt from "../../prompts.json";
import { getContentType } from "../../contentstack-sdk";
import TechnicalOfferingsResponse from "../../technical-offerings-response.json";
import { verifyJwt } from "../../helper/jwt";
export const config = { api: { bodyParser: false } };

const isVercel = process.env.VERCEL === "1";
const uploadsDir = isVercel
  ? "/tmp"
  : path.join(process.cwd(), "public/images/uploads");

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function readPDFContent(filePath: string) {
  const dataBuffer = fs.readFileSync(filePath);
  const options = {
    pagerender: async (pageData: any) => {
      const textContent = await pageData.getTextContent();
      let lastY: number | undefined,
        text = "";
      for (const item of textContent.items) {
        text +=
          lastY === item.transform[5] || !lastY ? item.str : "\n" + item.str;
        lastY = item.transform[5];
      }
      return text;
    },
  };
  const data = await pdfParse(dataBuffer, options);
  return data.text;
}

function groupFieldsByParentUid(fieldsList: any[]) {
  const groupedFields: Record<string, any[]> = {};
  fieldsList.forEach((field) => {
    const parentUid = field.parent_uid;
    if (parentUid) {
      if (!groupedFields[parentUid]) groupedFields[parentUid] = [];
      groupedFields[parentUid].push(field);
    }
  });
  return groupedFields;
}

function mergeArray(array1: any[], array2: any[]) {
  return array1.map((item) => {
    const referenceKeyParts = [item.uid, item.parent_uid];
    if (item.parent_to_uid) referenceKeyParts.push(item.parent_to_uid);
    const referenceKey = referenceKeyParts.join("+");

    const matched = array2?.find((ref) => ref.reference === referenceKey);
    return matched ? { ...item, value: matched.value } : item;
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  let decodedToken: any;
  try {
    decodedToken = verifyJwt(token);
    if (!decodedToken) throw new Error("Invalid JWT");
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const BASE_URL = `${req.headers["x-forwarded-proto"] || "http"}://${
    req.headers.host
  }`;

  const OPENAI_KEY = process.env.OPENAI_API_KEY as string;
  const GEMINI_KEY = process.env.GEMINI_API_KEY as string;
  const CUSTOM_BOT_KEY = process.env.CUSTOM_BOT_KEY as string;
  const CUSTOM_BOT_ENDPOINT = process.env.CUSTOM_BOT_ENDPOINT as string;

  const form = new IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json({ error: "Failed to parse form data" });

    const templateName = fields?.template;
    const selectedModel =
      fields?.model?.toString().toLowerCase() || "gpt-3.5-turbo";
    const url = fields?.url;
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if ((!file && !url) || (file && url)) {
      return res
        .status(400)
        .json({ error: "Provide either a PDF or a URL, not both" });
    }

    try {
      const templateNameStr = Array.isArray(templateName)
        ? templateName[0]
        : typeof templateName === "string"
        ? templateName
        : "";
      const getContentTypeDetail = await getContentType(
        templateNameStr,
        decodedToken
      );
      const schemas = getContentTypeDetail[0]?.schema;
      let pageSchemas =
        schemas?.filter((f: any) => f?.data_type === "blocks") || [];
      let pageComponents = pageSchemas[0]?.blocks;
      let allSchemaObjects: any[] = [];

      // Flatten blocks + global fields
      if (pageComponents) {
        allSchemaObjects =
          pageComponents.flatMap((component: any) =>
            Array.isArray(component?.schema)
              ? component.schema.flatMap((obj: any) => {
                  if (
                    obj?.data_type === "global_field" &&
                    Array.isArray(obj?.schema)
                  ) {
                    return obj.schema.map((nestedObj: any) => ({
                      ...nestedObj,
                      data_type: nestedObj?.data_type,
                      parent_to_uid: nestedObj?.uid,
                      parent_uid: component?.uid,
                      parent_title: component?.title,
                    }));
                  }
                  return {
                    ...obj,
                    parent_uid: component?.uid,
                    parent_to_uid: "",
                    parent_title: component?.title,
                  };
                })
              : []
          ) ?? [];
      }

      // Add root global fields
      const rootGlobalFields =
        schemas?.filter((f: any) => f?.data_type === "global_field") || [];
      const rootGlobalFieldsArray = rootGlobalFields.flatMap((comp: any) =>
        comp?.schema?.map((obj: any) => ({
          ...obj,
          parent_uid: comp?.uid,
          parent_to_uid: comp?.uid,
          parent_title: comp?.display_name,
          is_root: true,
        }))
      );
      allSchemaObjects = allSchemaObjects.concat(rootGlobalFieldsArray);

      // Add simple text/file fields
      schemas?.forEach((field: any) => {
        if (["text", "rich_text", "file"].includes(field.data_type)) {
          allSchemaObjects.push({
            ...field,
            parent_uid: "page_details",
            parent_title: "Page Details",
            is_root: true,
          });
        }
      });

      const textSchemaObjects = allSchemaObjects.filter((f: any) =>
        ["text", "rich_text"].includes(f.data_type)
      );
      const fileSchemaObjects = allSchemaObjects.filter(
        (f: any) => f.data_type === "file"
      );
      const referenceObjects = allSchemaObjects.filter(
        (f: any) => f.data_type === "reference"
      );

      let referenceFieldsList: any[] = [];
      const getReferenceFieldsAsync = async (
        entryName: string,
        field: any,
        jwtToken: string
      ) => {
        const resp = await fetch(
          `${BASE_URL}/api/get-content-entries/?content_name=${entryName}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        const data = await resp.json();
        if (data) {
          Object.assign(field, { values: data });
          referenceFieldsList.push(field);
        }
      };

      if (referenceObjects) {
        await Promise.all(
          referenceObjects.map(async (field: any) => {
            if (field?.reference_to) {
              return await getReferenceFieldsAsync(
                field.reference_to[0],
                field,
                token
              );
            }
          })
        );
      }

      // Read PDF or use URL
      let truncatedContent = "";
      let PDFLink = "";
      if (file?.mimetype === "application/pdf") {
        const filePath = file?.filepath;
        const fileName = file?.newFilename;
        console.log("File path:", filePath);
        console.log("file name:", fileName);
        PDFLink = `${BASE_URL}/images/uploads/${fileName}`;
        const pdfContent = await readPDFContent(filePath);
        truncatedContent = pdfContent.slice(0, 30000);
      } else if (url) {
        truncatedContent = Array.isArray(url) ? url[0] : url;
      }

      const instructions = Prompt?.instructions || [];
      const promptText = Prompt?.promptText || "";
      const prompt = `
        ${promptText}

        Instructions:
        ${instructions.join("\n")}

        Fields to generate:
        ${JSON.stringify(textSchemaObjects, null, 2)}

        Document:
        ${truncatedContent}
      `;

      // Generate AI output
      let finalFieldsArray: any[] = [];
      if (selectedModel === "custom_bot") {
        const response = await axios.post(
          CUSTOM_BOT_ENDPOINT,
          {
            blob_url: PDFLink || url,
            user_prompt:
              "Rewrite in a more engaging style, but maintain all important details.",
            brand_website_url: "https://www.netgear.com/about/",
            content_type: JSON.stringify(
              textSchemaObjects.map((f) => ({
                display_name: f.display_name,
                reference: f.parent_to_uid
                  ? `${f.uid}+${f.parent_uid}+${f.parent_to_uid}`
                  : `${f.uid}+${f.parent_uid}`,
                help_text: f.field_metadata?.instruction,
              })),
              null,
              2
            ),
          },
          {
            headers: {
              Authorization: `Bearer ${CUSTOM_BOT_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const parsedTemp = Array.isArray(response.data.result)
          ? response.data.result
          : TechnicalOfferingsResponse;

        finalFieldsArray = [
          ...mergeArray(textSchemaObjects, parsedTemp),
          ...fileSchemaObjects,
          ...referenceFieldsList,
        ];
      } else if (selectedModel.includes("gemini")) {
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: selectedModel });
        const result = await model.generateContent(prompt);
        const rawOutput = result.response
          .text()
          .replace(/^```json\n|```$/g, "")
          .trim();
        finalFieldsArray = [
          ...JSON.parse(rawOutput),
          ...fileSchemaObjects,
          ...referenceFieldsList,
        ];
      } else if (selectedModel.includes("gpt")) {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: OPENAI_KEY });
        const result = await openai.chat.completions.create({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        const messageContent = result.choices[0].message.content;
        const rawOutput = messageContent
          ? messageContent.replace(/^```json\n|```$/g, "").trim()
          : "";
        finalFieldsArray = [
          ...JSON.parse(rawOutput),
          ...fileSchemaObjects,
          ...referenceFieldsList,
        ];
      }

      const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
      res.status(200).json({ summary: JSON.stringify(groupedOutput, null, 2) });
    } catch (error: any) {
      console.error("Handler error:", error);
      res
        .status(500)
        .json({ error: error.message || "Unexpected server error" });
    }
  });
}
