// set-stack-info.ts
import type { NextApiRequest, NextApiResponse } from "next";

let stackCache: { apiKey?: string; cmaToken?: string } | null = null;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    stackCache = req.body;
    console.log("✅ Stack cache updated:", stackCache);
    return res.status(200).json({ success: true });
  }

  if (req.method === "GET") {
    if (!stackCache) {
      return res.status(400).json({ error: "Stack info not set yet. Please POST stack info first." });
    }
    return res.status(200).json(stackCache);
  }

  res.status(405).end();
}

// Helper to get current stack info
export function getServerStack() {
  return stackCache;
}
