import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../helper/jwt";

export default async function handlerCreateFolder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const stack = verifyJwt(token);

    if (!stack?.apiKey || !stack?.cmaToken) {
      return res.status(400).json({ error: "Missing stack info in JWT" });
    }

    const response = await fetch(
      `https://api.contentstack.io/v3/assets/folders`,
      {
        method: "POST",
        headers: {
          api_key: stack.apiKey,
          authorization: stack.cmaToken,
          "Content-Type": "application/json",
        },
        body: req.body ? JSON.stringify(req.body) : null,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Contentstack error:", data);
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (err: any) {
    console.error("❌ Error in create-folder API:", err.message);
    res.status(500).json({ error: "Failed to create folder" });
  }
}
