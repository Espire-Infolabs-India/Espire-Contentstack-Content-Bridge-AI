import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { getServerStack } from "./set-stack-info";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { include_global_field_schema = "true" } = req.query;
    console.log("⏳ Waiting 10 seconds before getting stack info...");
    await delay(10000);
    const stack = getServerStack();
    console.log("Stack info in get-content-types API:", stack);

    if (!stack) {
  return res.status(400).json({ error: "Stack info not set yet. Please POST stack info first." });
}
    if (!stack?.apiKey || !stack?.cmaToken) {
      console.error("❌ Stack info missing:", stack);
      return res.status(400).json({ error: "Missing stack info (apiKey or cmaToken)" });
    }

    const url = `https://api.contentstack.io/v3/content_types?include_global_field_schema=${include_global_field_schema}`;
    const response = await axios.get(url, {
      headers: {
        api_key: stack.apiKey,
        authorization: stack.cmaToken,
      },
    });

    res.status(200).json({ content_types: response.data.content_types });
  } catch (err: any) {
    console.error("❌ Error in get-content-types API:", err.message);
    res.status(500).json({ error: "Failed to fetch content types" });
  }
}
