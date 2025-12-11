import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { verifyJwt } from "../../helper/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const url = "https://api.contentstack.io/v3/assets?include_folders=true";
    const response = await axios.get(url, {
      headers: {
        api_key: stack.apiKey,
        authorization: stack.cmaToken,
      },
    });

    res.status(200).json(response.data);
  } catch (err: any) {
    console.error(
      "❌ Error in get-assets API:",
      err.response?.data || err.message
    );
    res
      .status(err.response?.status || 500)
      .json({ error: err.response?.data || "Failed to fetch assets" });
  }
}
