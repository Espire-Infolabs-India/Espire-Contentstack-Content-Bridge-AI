import axios from "axios";

export const fetchAllContentTypes = async (jwt: string): Promise<any[]> => {
  try {
    const res = await axios.get("/api/get-content-types", {
      headers: { Authorization: `Bearer ${jwt}` }, // pass JWT
    });
    return res.data.content_types;
  } catch (err) {
    console.error("❌ Error fetching all content types:", err);
    return [];
  }
};
