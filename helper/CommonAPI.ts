import axios from "axios";

export const fetchAssets = async (jwt: string) => {
  const res = await axios.get("/api/fetch-assets", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return res.data.assets;
};

export const fetchFolders = async (jwt: string) => {
  const res = await axios.get("/api/fetch-folders", {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  return res.data.assets.filter((folder: { name: string }) => folder?.name);
};

export const createFolder = async (jwt: string, name: string) => {
  return axios.post(
    "/api/create-folder",
    { asset: { name } },
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
};

export const uploadAsset = async (
  jwt: string,
  file: File,
  parent_uid: string
) => {
  const formData = new FormData();
  formData.append("asset[upload]", file);
  formData.append("asset[title]", file.name);
  formData.append("asset[parent_uid]", parent_uid);

  const res = await fetch("/api/upload-asset", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Failed to upload asset");
  }

  return res.json();
};

//Fetch Content Types
export const fetchAllContentTypes = async (jwt: string): Promise<any[]> => {
  try {
    const res = await axios.get("/api/get-content-types", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    return res.data.content_types;
  } catch (err) {
    console.error("❌ Error fetching all content types:", err);
    return [];
  }
};
