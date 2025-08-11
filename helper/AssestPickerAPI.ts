import axios from "axios";
import { getStackInfo } from "./get-stack-details";
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

export const fetchAssets = async () => {
  const headers = await getHeaders();
  const res = await axios.get("/api/fetch-assets", { headers });
  return res.data.assets;
};

export const fetchFolders = async () => {
  const headers = await getHeaders();
  const res = await axios.get("/api/fetch-folders", { headers });
  return res.data.assets.filter((folder: { name: string }) => folder?.name);
};

export const createFolder = async (name: string) => {
  const headers = await getHeaders();
  return axios.post(
    "/api/create-folder",
    { asset: { name: name } },
    { headers }
  );
};

export const uploadAsset = async (file: File, parent_uid: string) => {
  const headers = await getHeaders();
  const formData = new FormData();
  formData.append("asset[upload]", file);
  formData.append("asset[title]", file.name);
  formData.append("asset[parent_uid]", parent_uid);

  const res = await fetch("https://api.contentstack.io/v3/assets", {
    method: "POST",
    headers,
    body: formData,
  });

  return res.json();
};
