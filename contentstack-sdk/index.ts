import { fetchContentTypes } from "../helper/GenerateContentAPI";
import { getStackInfo } from "../helper/get-stack-details";


async function getEntry({
  contentTypeUid,
  entryUid,
}: {
  contentTypeUid: string;
  entryUid: string;
}) {
  const url = `https://cdn.contentstack.io/v3/content_types/${contentTypeUid}/entries/${entryUid}?environment=${process.env.CONTENTSTACK_ENVIRONMENT}`;
  const stackdata = await getStackInfo();
  const response = await fetch(url, {
    headers: {
      api_key: stackdata?.apiKey!,
      access_token: stackdata?.deliveryToken!,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching entry: ${response.statusText}`);
  }

  const data = await response.json();
  return data.entry;
}

// async function getContentTypes({
//   includeGlobalFieldSchema = true,
// }: {
//   includeGlobalFieldSchema?: boolean;
// }) {
//   const url = `https://api.contentstack.io/v3/content_types/?include_global_field_schema=${includeGlobalFieldSchema}`;
//   const stackdata = await getStackInfo();
//   console.log("stackdata",stackdata);
//   const response = await fetch(url, {
//     headers: {
//       api_key: stackdata?.apiKey!,
//       authorization: stackdata?.cmaToken!,
//     },
//   });

//   if (!response.ok) {
//     throw new Error(`Error fetching content types: ${response.statusText}`);
//   }

//   const data = await response.json();

//   return data.content_types;
// }

export async function resolveNestedEntry(entry: any): Promise<any> {
  async function resolveDeep(obj: any): Promise<any> {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(resolveDeep));
    }
    if (obj && typeof obj === "object") {
      if (obj.uid && obj._content_type_uid) {
        try {
          const resolved = await getEntry({
            contentTypeUid: obj._content_type_uid,
            entryUid: obj.uid,
          });
          return resolveDeep(resolved);
        } catch (err) {
          console.error(
            `❌ Failed to resolve entry for ${obj._content_type_uid}/${obj.uid}:`,
            err
          );
          return obj;
        }
      }
      const resolvedObj: any = {};
      for (const key of Object.keys(obj)) {
        resolvedObj[key] = await resolveDeep(obj[key]);
      }
      return resolvedObj;
    }
    return obj;
  }
  return await resolveDeep(entry);
}

// export async function getContentType(contentType: string) {
//   console.log("Inside getContentType function with contentType:", contentType);
//   try {
//     console.log("Inside try block of getContentType");
//     try{
//     const content_types =  await fetchContentTypes(true);
//     }catch(err){
//       console.error("Error fetching content types:", err);

//     }


// // console.log("Content types fetched:", content_types);
//     const pageContentTypes = content_types.filter(
//       (ct: any) => ct.uid == contentType
//     );
//     const resolvedEntries = await Promise.all(
//       pageContentTypes.map((entry: any) => resolveNestedEntry(entry))
//     );

//     return resolvedEntries;
//   } catch (err) {
//     console.error("❌ Error fetching entries:", err);
//     return [];
//   }
// }

export async function getContentType(contentType: string) {
  try {
    let content_types: any[] = [];

    try {
      content_types = await fetchContentTypes(true);
    } catch (err) {
      console.error("❌ Error fetching content types:", err);
      return []; 
    }
    console.log("Content types Loaded   ::::");
    const pageContentTypes = content_types.filter(
      (ct: any) =>
        Array.isArray(contentType)
          ? contentType.includes(ct.uid)
          : ct.uid === contentType
    );

    console.log("Page Content Types   ::::", pageContentTypes);

    if (pageContentTypes.length === 0) {
      console.warn(`⚠️ No content type found for uid: ${contentType}`);
      return [];
    }

    const resolvedEntries = await Promise.all(
      pageContentTypes.map((entry: any) => resolveNestedEntry(entry))
    );

    return resolvedEntries;
  } catch (err) {
    console.error("❌ Error in getContentType:", err);
    return [];
  }
}
