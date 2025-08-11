import axios, { AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api_key =
    typeof req.headers.api_key === "string"
      ? req.headers.api_key
      : Array.isArray(req.headers.api_key)
      ? req.headers.api_key[0]
      : "";

  const authorization =
    typeof req.headers.authorization === "string"
      ? req.headers.authorization
      : Array.isArray(req.headers.authorization)
      ? req.headers.authorization[0]
      : "";

  if (!api_key || !authorization) {
    return res.status(400).json({ error: "Missing api_key or authorization" });
  }

  const config: AxiosRequestConfig = {
    method: "GET",
    url: "https://api.contentstack.io/v3/content_types",
    headers: {
      api_key,
      authorization,
    },
  };

  try {
    const response = await axios(config);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in get-content-type API:", error);
    res.status(500).json({ error: "Failed to fetch content types" });
  }
}
