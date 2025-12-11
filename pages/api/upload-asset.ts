import type { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../helper/jwt";

export const config = { api: { bodyParser: false } };

export default async function handlerUploadAsset(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const stack = verifyJwt(token);
    if (!stack?.apiKey || !stack?.cmaToken)
      return res.status(400).json({ error: "Missing stack info in JWT" });

    const headers: Record<string, string> = {
      api_key: stack.apiKey,
      authorization: stack.cmaToken,
    };
    if (req.headers["content-type"])
      headers["content-type"] = req.headers["content-type"] as string;

    const response = await fetch("https://api.contentstack.io/v3/assets", {
      method: "POST",
      headers,
      body: req as any,
      // @ts-expect-error duplex is required at runtime
      duplex: "half",
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data });

    res.status(200).json(data);
  } catch (err: any) {
    console.error("❌ Upload failed:", err);
    res.status(500).json({ error: "Failed to upload asset" });
  }
}
