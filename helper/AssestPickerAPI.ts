// utils/api.ts
import axios from "axios";

const headers = {
  api_key: process.env.API_KEY as string,
  authorization: process.env.AUTHORIZATION as string,
};

export const fetchAssets = async () => {
  const res = await axios.get("/api/fetch-assets", { headers });
  return res.data.assets;
};

export const fetchFolders = async () => {
  const res = await axios.get("/api/fetch-folders", { headers });
  return res.data.assets.filter((folder: { name: string }) => folder?.name);
};

export const createFolder = async (name: string) => {
  return axios.post("/api/create-folder", { asset: { name } }, { headers });
};

export const uploadAsset = async (file: File, parent_uid: string) => {
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
