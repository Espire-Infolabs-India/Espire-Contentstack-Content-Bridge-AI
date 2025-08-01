import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Prompt from "../../prompts.json";
import { getContentType } from "../../contentstack-sdk";
import TechnicalOfferingsResponse from "../../technical-offerings-response.json";

export const config = {
  api: {
    bodyParser: false,
  },
};

const isVercel = process.env.VERCEL === "1";

//const uploadsDir = isVercel ? "/tmp" : path.join(process.cwd(), "public/images/uploads");
const uploadsDir = path.join(process.cwd(), "public/images/uploads");

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

 function groupFieldsByParentUid(fieldsList){
    const groupedFields = {};
    fieldsList.forEach(field => {
      const parentUid = field.parent_uid;
      if (parentUid) {
          if (!groupedFields[parentUid]) {
            groupedFields[parentUid] = [];
          }
          groupedFields[parentUid].push(field);
      }
    });

    return groupedFields;
}

function mergeArray(array1, array2){
    const mergedArray = array1.map(item => {
      // Create key using item.uid + parent_uid (+ parent_to_uid if exists)
      const referenceKeyParts = [item.uid, item.parent_uid];
      if (item.parent_to_uid) {
        referenceKeyParts.push(item.parent_to_uid);
      }
      const referenceKey = referenceKeyParts.join('+');

      // Find match in array2
      const matched = array2?.find(ref => ref.reference === referenceKey);

      // If match found, merge value into item
      if (matched) {
        return {
          ...item,
          value: matched.value
        };
      }

      return item;
    });

    return mergedArray;
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
        const getContentTypeDetail = await getContentType(templateName);
        const schemas = getContentTypeDetail[0]?.schema;

        let pageTitle = getContentTypeDetail[0]?.title;
        let pageUid = getContentTypeDetail[0]?.uid;
        let pageSchemas = schemas?.filter((field) => field?.data_type == 'blocks') || []; 
        
        let pageComponents = pageSchemas[0]?.blocks;
        let allSchemaObjects = [];

        if(pageComponents && pageComponents != undefined){ 
          allSchemaObjects = pageComponents?.flatMap(component =>
            Array.isArray(component?.schema)
              ? component.schema.flatMap(obj => {
                  if (obj?.data_type === 'global_field' && Array.isArray(obj?.schema)) {
                    // Flatten the nested global_field schema too
                    return obj.schema.map(nestedObj => ({
                      ...nestedObj,
                      data_type: nestedObj?.data_type,
                      parent_to_uid: nestedObj?.uid,
                      parent_uid: component?.uid,
                      parent_title: component?.title
                    }));
                  }
                  return {
                    ...obj,
                    parent_uid: component?.uid,
                    parent_to_uid: '',
                    parent_title: component?.title
                  };
                })
              : []
          ) ?? [];
        }
        
        let rootGlobalFieldsArray = [];
        let rootGlobalFields = schemas?.filter((field) => field?.data_type == 'global_field') || []; 
        if(rootGlobalFields && rootGlobalFields != undefined){ 
          rootGlobalFieldsArray = rootGlobalFields?.flatMap(component =>
            component?.schema?.map(obj => ({
              ...obj,
              parent_uid: component?.uid,
              parent_to_uid: component?.uid,
              parent_title: component?.display_name,
              is_root:true
            }))
          );
        }

        allSchemaObjects = allSchemaObjects?.concat(rootGlobalFieldsArray);
        
        schemas?.filter((field) => {
          if(field?.data_type == 'text' || field?.data_type == 'rich_text' || field?.data_type == 'file'){
            field = Object?.assign(field, {parent_uid: 'page_details', parent_title: 'Page Details', is_root: true})
            allSchemaObjects?.push(field);
          }
        });

        let textSchemaObjectsForChatBot = allSchemaObjects?.filter((field) => field?.data_type == 'text' || field?.data_type == 'rich_text') || []; 
        let fileSchemaObjectsForChatBot = allSchemaObjects?.filter((field) => field?.data_type == 'file') || []; 
        let referenceObjects = allSchemaObjects?.filter((field) => field?.data_type == 'reference') || []; 
        
        let textSchemaObjectsForChatBotFiltered = allSchemaObjects?.map((field) => ({
          "display_name": field?.field_metadata?.instruction || field?.display_name,
          "reference": (field?.parent_to_uid) ? field?.uid+'+'+field?.parent_uid+'+'+field?.parent_to_uid : field?.uid+'+'+field?.parent_uid,
        }));

        let refrerenceFieldsList = [];
        let getReferenceFieldsAsync = (async(entryName, field) => {
            let getEntries = await fetch(`${process?.env?.BASE_URL}/api/get-content-entries/?content_name=${entryName}`);
            let getEntriesData = await getEntries.json();
            if(getEntriesData){
              Object.assign(field, {values: getEntriesData});
              refrerenceFieldsList?.push(field);
            }
        });

       if(referenceObjects && referenceObjects != undefined){
          await Promise.all(referenceObjects?.map(async (field) => {
            if(field?.reference_to && field?.data_type == "reference"){
              let entryName = field?.reference_to[0];
              let displayName = field?.display_name;
              let actual_uid = field?.uid;
              return await getReferenceFieldsAsync(entryName, field);
            }
          }));
        }



        let truncatedContent = "";
        let PDFLink = "";
        if (file?.mimetype === "application/pdf") {
          const filePath = file?.filepath;
          const fileName = file?.newFilename;

          // if(isVercel){
          //   PDFLink = process?.env?.BASE_URL+'/tmp/'+fileName;
          // }else{
          //   PDFLink = process?.env?.BASE_URL+'/images/uploads/'+fileName;
          // }
          PDFLink = process?.env?.BASE_URL+'/images/uploads/'+fileName;
          
          const pdfContent = await readPDFContent(filePath);
          truncatedContent = pdfContent.slice(0, 30000);
          //fs.unlink(filePath, () => {}); // Clean up uploaded file
        } else if (url) {
          truncatedContent = url;
        }

        const instructions = Prompt?.instructions || [];
        const promptText = Prompt?.promptText || "";

        const prompt = `
          ${promptText}

          Instructions:
          ${instructions.join("\n")}

          Fields to generate:
          ${JSON.stringify(textSchemaObjectsForChatBot, null, 2)}

          Document:
          ${truncatedContent}
        `;

        // let tempData = TechnicalOfferingsResponse;
        //     const mergedResponse = mergeArray(textSchemaObjectsForChatBot, tempData);
        //     let finalFieldsArray = [...mergedResponse, ...fileSchemaObjectsForChatBot , ...refrerenceFieldsList];
        //     const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
        //     res.status(200).json({"summary": JSON.stringify(groupedOutput, null, 2) });

      let rawOutput = "";
      if(selectedModel == "custom_bot"){
        var data = {
          "blob_url": (PDFLink == "") ? url[0] : PDFLink,
          "user_prompt": "Rewrite in a more engaging style, but maintain all important details.", // Remain Static as of now
          "brand_website_url": "https://www.oki.com/global/profile/brand/", // Remain Static as of now
          "content_type": JSON.stringify(textSchemaObjectsForChatBotFiltered, null, 2),//textSchemaObjectsForChatBot,
        };

        var config = {
          method: 'post',
          url: 'https://cms-auto-agent-mobmv.eastus2.inference.ml.azure.com/score',
          headers: { 
            'Authorization': 'Bearer CdnKkRIiO5llGRwdQt1oNPdyXZ4I31uKubIE3QRzi4A0n0B2sxeuJQQJ99BGAAAAAAAAAAAAINFRAZML2lSk', 
            'Content-Type': 'application/json'
          },
          data : data
        };

        axios(config)
        .then(function (response) {
          const parsedTemp = response?.data?.result;
          //console.log('_____________________parsedTemp',parsedTemp);
          if(Array.isArray(parsedTemp)){
            const mergedResponse = mergeArray(textSchemaObjectsForChatBot, parsedTemp);
            let finalFieldsArray = [...mergedResponse, ...fileSchemaObjectsForChatBot , ...refrerenceFieldsList];
            const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
            res.status(200).json({"summary": JSON.stringify(groupedOutput, null, 2) });
          }else{
            console.log('_____________________Failure');
            let tempData = TechnicalOfferingsResponse;
            const mergedResponse = mergeArray(textSchemaObjectsForChatBot, tempData);
            let finalFieldsArray = [...mergedResponse, ...fileSchemaObjectsForChatBot , ...refrerenceFieldsList];
            const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
            res.status(200).json({"summary": JSON.stringify(groupedOutput, null, 2) });
          }
        });
      }else if (selectedModel.includes("gemini")) {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: selectedModel });
          const result = await model.generateContent(prompt);
          rawOutput = result.response.text().replace(/^```json\n|```$/g, "").trim();

          const parsedTemp = JSON.parse(rawOutput);
          let finalFieldsArray = [...parsedTemp, ...fileSchemaObjectsForChatBot , ...refrerenceFieldsList];
          const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
          res.status(200).json({"summary": JSON.stringify(groupedOutput, null, 2) });
      } else if (selectedModel.includes("gpt")) {
          console.log('________in gpt');
          const { OpenAI } = await import("openai");
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          const result = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
          });

          rawOutput = result.choices[0].message.content.replace(/^```json\n|```$/g, "").trim();
          const parsedTemp = JSON.parse(rawOutput);
          let finalFieldsArray = [...parsedTemp, ...fileSchemaObjectsForChatBot , ...refrerenceFieldsList];
          const groupedOutput = groupFieldsByParentUid(finalFieldsArray);
          res.status(200).json({"summary": JSON.stringify(groupedOutput, null, 2) });
      }
    } catch (error) {
      console.error("Handler error:", error);
      return res.status(500).json({
        error: error.message || "Unexpected server error",
      });
    }
  });
}
