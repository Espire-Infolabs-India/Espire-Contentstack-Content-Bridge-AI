import type { NextApiRequest, NextApiResponse } from "next";
import { issueJwt } from "../../helper/jwt";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { cmaToken, deliveryToken, appRegion, apiKey, branch, stackname } = req.body;

  if (!cmaToken || !deliveryToken || !apiKey || !appRegion || !branch || !stackname) {
    return res.status(400).json({ error: "Missing config" });
  }

  const token = issueJwt({ cmaToken, deliveryToken, appRegion, apiKey, branch, stackname });
  res.status(200).json({ token });
}
