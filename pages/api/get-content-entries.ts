import axios, { AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { getStackInfo } from "../../helper/get-stack-details";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const contentName = req?.query?.content_name as string;
  const stackData = await getStackInfo();
  const api_key = stackData?.apiKey as string;
  const authorization = stackData?.deliveryToken as string;
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
