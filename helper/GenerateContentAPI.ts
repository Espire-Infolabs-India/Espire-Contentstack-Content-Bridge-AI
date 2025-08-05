import axios from "axios";
import { getStackInfo } from "./get-stack-details";

async function getHeaders() {
  const stackData = await getStackInfo();
  if (!stackData || !stackData.apiKey || !stackData.cmaToken) {
    throw new Error("Missing stack info (apiKey or cmaToken)");
  }

  return {
    api_key: stackData.apiKey,
    authorization: stackData.cmaToken,
  };
}

export const fetchAllContentTypes = async () => {
  const headers = await getHeaders();
  const res = await axios.get("/api/get-content-types", { headers });
  console.log("fetchAllContentTypes",res)
  return res.data.content_types;
};

