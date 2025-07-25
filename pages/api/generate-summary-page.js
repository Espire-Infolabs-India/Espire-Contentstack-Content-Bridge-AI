import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Prompt from "../../prompts.json";

export const config = {
  api: {
    bodyParser: false,
  },
};


const isVercel = process.env.VERCEL === "1";
const uploadsDir = isVercel ? "/tmp" : path.join(process.cwd(), "uploads");

// Ensure uploads directory exists locally
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

async function readPDFContent(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const options = {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      let lastY, text = "";
      for (const item of textContent.items) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += "\n" + item.str;
        }
        lastY = item.transform[5];
      }
      return text;
    },
  };
  const data = await pdfParse(dataBuffer, options);
  return data.text;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new IncomingForm({
    uploadDir: uploadsDir,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Failed to parse form data" });
    }

    const templateName = fields?.template;
    const selectedModel = fields?.model?.toString().toLowerCase() || "gpt-3.5-turbo";
    const url = fields?.url;
    const file = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf;

    if ((!file && !url) || (file && url)) {
      return res.status(400).json({ error: "Provide either a PDF or a URL, not both" });
    }

    try {
      const templateConfig = {
        method: "GET",
        url: `https://api.contentstack.io/v3/content_types/${templateName}`,
        headers: {
          authorization: process.env.AUTHORIZATION,
          api_key: process.env.API_KEY,
        },
      };

      const response = await axios(templateConfig);
      const schemas = response?.data?.content_type?.schema;

       

        let refrerenceFieldsList = [];
        let getReferenceFieldsAsync = (async(entryName, displayName, actual_uid) => {
            let getEntries = await fetch(`${process?.env?.BASE_URL}/api/get-content-entries/?content_name=${entryName}`);
            let getEntriesData = await getEntries.json();
            if(getEntriesData){
              refrerenceFieldsList.push({displayName: displayName, key: entryName, values: getEntriesData?.entries, actual_uid: actual_uid});
            }
        });
        
        await Promise.all(schemas?.map(async (field) => {
          if(field?.reference_to && field?.data_type == "reference"){
            let entryName = field?.reference_to[0];
            let displayName = field?.display_name;
            let actual_uid = field?.uid;
            return await getReferenceFieldsAsync(entryName, displayName, actual_uid);
          }
        }));

        let fileFieldList = [];
        let templateFields = [];
        schemas?.forEach((field) => {
          if (field?.data_type == "text" && field?.display_type != "dropdown") {
            templateFields.push({
              [field.uid]: field?.field_metadata?.instruction || field?.display_name,
            });
          }else if(field?.data_type == "file"){
            fileFieldList.push({displayName: field?.display_name, actual_key: field?.uid});
          }
        });
        
        let tempTemplateFields = [];
        schemas?.forEach((field) => {
          if (field?.data_type == "text") {
            tempTemplateFields.push({
              key: field.uid,
              value: field.display_name,
            });
          }
        });

      let truncatedContent = "";
      if (file?.mimetype === "application/pdf") {
        const filePath = file.filepath;
        const pdfContent = await readPDFContent(filePath);
        truncatedContent = pdfContent.slice(0, 30000);
        fs.unlink(filePath, () => {}); // Clean up uploaded file
      } else if (url) {
        truncatedContent = url;
      }

      console.log('-------------templateFields',templateFields);


      const instructions = Prompt?.instructions || [];
      const promptText = Prompt?.promptText || "";

      const prompt = `
        ${promptText}

        Instructions:
        ${instructions.join("\n")}

        Fields to generate:
        ${JSON.stringify(templateFields, null, 2)}

        Document:
        ${truncatedContent}
      `;


      let rawOutput = "";

      if (selectedModel.includes("gemini")) {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: selectedModel });
        const result = await model.generateContent(prompt);
        rawOutput = result.response.text().replace(/^```json\n|```$/g, "").trim();
      } else if (selectedModel.includes("gpt")) {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await openai.chat.completions.create({
          model: selectedModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        rawOutput = result.choices[0].message.content.replace(/^```json\n|```$/g, "").trim();
      }

      let parsed;
      try {
        const parsedTemp = JSON.parse(rawOutput);
        const keyMap = Object.fromEntries(
          tempTemplateFields.map(({ key, value }) => [key, value])
        );
        parsed = parsedTemp?.map((obj) => {
          const [oldKey] = Object.keys(obj);
          const newKey = keyMap[oldKey] || oldKey;
          return {
            [newKey]: obj[oldKey],
            actual_key: oldKey,
            key: newKey,
            value: obj[oldKey],
          };
        });
      } catch (jsonErr) {
        console.error("Failed to parse model output:", jsonErr);
        return res.status(500).json({ error: "Model returned invalid JSON" });
      }

        res.status(200).json({"referenceFields": refrerenceFieldsList, "fileFieldList": fileFieldList, "summary": JSON.stringify(parsed, null, 2) });

    } catch (error) {
      console.error("Handler error:", error);
      return res.status(500).json({
        error: error.message || "Unexpected server error",
      });
    }
  });
}
