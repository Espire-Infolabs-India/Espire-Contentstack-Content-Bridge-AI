import axios from "axios";
import { getStackInfo } from "./get-stack-details";
import { getServerStack } from "../pages/api/set-stack-info";

async function getHeaders() {
  const stackData = await getStackInfo();
  if (!stackData || !stackData.apiKey || !stackData.cmaToken) {
    throw new Error("Missing stack info (apiKey or cmaToken)");
  }
  return {
    api_key: stackData?.apiKey as string,
    authorization: stackData?.cmaToken as string,
  };
}

export const fetchAllContentTypes = async (): Promise<any[]> => {
  try {
    const res = await axios.get("/api/get-content-types");
    return res.data.content_types;
  } catch (err) {
    console.error("❌ Error fetching all content types:", err);
    return [];
  }
};



const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchContentTypes = async (
  includeGlobalFieldSchema: boolean = true
): Promise<any[]> => {
  await delay(10000);
  const stack = getServerStack();
  if (!stack?.apiKey || !stack?.cmaToken) {
    console.error("❌ Stack info not set");
    return [];
  }
  try {
    const url = `https://api.contentstack.io/v3/content_types?include_global_field_schema=${includeGlobalFieldSchema}`;
    const res = await axios.get(url, {
      headers: { api_key: stack.apiKey, authorization: stack.cmaToken },
    });

    return res.data.content_types || [];
  } catch (err: any) {
    console.error("❌ Error fetching content types:", err.message || err);
    return [];
  }
};
