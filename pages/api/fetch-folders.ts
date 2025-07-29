import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api_key = Array.isArray(req.headers.api_key)
    ? (req.headers.api_key[0] as string)
    : (req.headers.api_key as string);
  const authorization = Array.isArray(req.headers.authorization)
    ? (req.headers.authorization[0] as string)
    : (req.headers.authorization as string);

  const response = await fetch(
    `https://api.contentstack.io/v3/assets?include_folders=true`,
    {
      headers: { api_key, authorization },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error("Contentstack error:", error);
    return res.status(response.status).json({ error });
  }

  const data = await response.json();
  res.status(response.status).json(data);
}
