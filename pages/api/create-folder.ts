import { NextApiRequest, NextApiResponse } from "next";

export default async function handlerCreateFolder(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api_key = Array.isArray(req.headers.api_key)
    ? req.headers.api_key[0]
    : req.headers.api_key || "";
  const authorization = Array.isArray(req.headers.authorization)
    ? req.headers.authorization[0]
    : req.headers.authorization || "";
  const response = await fetch(
    `https://api.contentstack.io/v3/assets/folders`,
    {
      method: "POST",
      headers: {
        api_key,
        authorization,
        "Content-Type": "application/json",
      },
      body: req.body ? JSON.stringify(req.body) : null,
    }
  );
  const data = await response.json();
  res.status(200).json(data);
}
