import ContentstackLivePreview from "@contentstack/live-preview-utils";
import getConfig from "next/config";
import {
  customHostUrl,
  initializeContentStackSdk,
  isValidCustomHostUrl,
} from "./utils";



let customHostBaseUrl = envConfig.CONTENTSTACK_API_HOST as string;
customHostBaseUrl = customHostBaseUrl ? customHostUrl(customHostBaseUrl) : "";

// SDK initialization
const Stack = initializeContentStackSdk();

// set host url only for custom host or non prod base url's
if (customHostBaseUrl && isValidCustomHostUrl(customHostBaseUrl)) {
  Stack.setHost(customHostBaseUrl);
}


export async function resolveNestedEntry(entry: any): Promise<any> {
  async function resolveDeep(obj: any): Promise<any> {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(resolveDeep));
    }
    if (obj && typeof obj === "object") {
      if (obj.uid && obj._content_type_uid) {
        try {
          const resolved = await Stack.ContentType(obj._content_type_uid)
            .Entry(obj.uid)
            .toJSON()
            .fetch();
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


export async function getContentType(contentType: string) {
  try {
    const { content_types } = await Stack.getContentTypes({
      include_global_field_schema: true,
    });

    const pageContentTypes = content_types.filter(
      (ct: any) => ct.uid == contentType
    );

    const resolvedEntries = await Promise.all(
      pageContentTypes.map((entry) => resolveNestedEntry(entry))
    );
    return resolvedEntries;
  } catch (err) {
    console.error("❌ Error fetching entries:", err);
    return [];
  }
}
