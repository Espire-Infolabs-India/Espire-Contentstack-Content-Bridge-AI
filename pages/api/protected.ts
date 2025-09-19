import type { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../helper/jwt";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  console.log("Auth Headers:", authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyJwt(token);
    res.status(200).json({ message: "Protected API data", config: decoded });
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
