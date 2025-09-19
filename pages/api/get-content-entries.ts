import axios, { AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { verifyJwt } from "../../helper/jwt";
import { ConfigPayload } from "../../helper/PropTypes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const contentName = req?.query?.content_name as string;

  // Get JWT from Authorization header
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];

  // Verify JWT and get payload
  let stackData: ConfigPayload;
  try {
    stackData = verifyJwt(token); // returns payload containing apiKey, deliveryToken, etc.
  } catch (err: any) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const api_key = stackData?.apiKey;
  const authorization = stackData?.cmaToken;

  if (!api_key || !authorization) {
    return res.status(400).json({ error: "Missing stack info in JWT" });
  }

  if (!contentName) {
    return res
      .status(400)
      .json({ error: "Missing content_name in query params" });
  }

  const config: AxiosRequestConfig = {
    method: "GET",
    url: `https://api.contentstack.io/v3/content_types/${contentName}/entries`,
    headers: {
      api_key,
      authorization,
    },
  };

  try {
    const response = await axios(config);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error in get-content-type API:", error?.message || error);
    return res.status(500).json({ error: "Failed to fetch entries" });
  }
}
