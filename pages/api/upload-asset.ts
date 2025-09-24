import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import axios from "axios";
import FormData from "form-data"; // ✅ use node form-data
import { verifyJwt } from "../../helper/jwt";

export const config = {
  api: { bodyParser: false },
};

const parseForm = (req: NextApiRequest) =>
  new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

export default async function handlerUploadAsset(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const stack = verifyJwt(token);

    if (!stack?.apiKey || !stack?.cmaToken)
      return res.status(400).json({ error: "Missing stack info in JWT" });

    const { fields, files } = await parseForm(req);
    const file = files["asset[upload]"] as unknown as File; 
    const parent_uid = fields["asset[parent_uid]"] as unknown as string;
    const title = fields["asset[title]"] as unknown as string;

    if (!file || !parent_uid || !title)
      return res.status(400).json({ error: "File, title or parent_uid missing" });

    // ✅ Node.js FormData
    const formData = new FormData();
    formData.append("asset[upload]", fs.createReadStream(file.filepath), file?.originalFilename as string);
    formData.append("asset[title]", title);
    formData.append("asset[parent_uid]", parent_uid);

    // ✅ Axios with form-data headers
    const response = await axios.post("https://api.contentstack.io/v3/assets", formData, {
      headers: {
        api_key: stack.apiKey,
        authorization: stack.cmaToken,
        ...formData.getHeaders(), // required for multipart/form-data in Node
      },
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error("❌ Error in upload-asset API:", err.response?.data || err.message || err);
    res.status(err.response?.status || 500).json({
      error: err.response?.data || "Failed to upload asset",
    });
  }
}
