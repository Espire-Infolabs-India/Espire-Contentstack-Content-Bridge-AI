import ContentstackLivePreview from "@contentstack/live-preview-utils";
import getConfig from "next/config";
import {
  customHostUrl,
  initializeContentStackSdk,
  isValidCustomHostUrl,
} from "./utils";
import { getStackInfo } from "../helper/get-stack-details";

const { publicRuntimeConfig } = getConfig();
const envConfig = process.env.CONTENTSTACK_API_KEY
  ? process.env
  : publicRuntimeConfig;

let customHostBaseUrl = envConfig.CONTENTSTACK_API_HOST as string;
customHostBaseUrl = customHostBaseUrl ? customHostUrl(customHostBaseUrl) : "";

const Stack = initializeContentStackSdk();

ContentstackLivePreview.init({
  //@ts-ignore
  stackSdk: Stack,
  clientUrlParams: {
    host: envConfig.CONTENTSTACK_APP_HOST,
  },
  ssr: false,
})?.catch((err) => console.error(err));

export const { onEntryChange } = ContentstackLivePreview;

const renderOption = {
  span: (node: any, next: any) => next(node.children),
};

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

async function getContentTypes({
  includeGlobalFieldSchema = true,
}: {
  includeGlobalFieldSchema?: boolean;
}) {
  const url = `https://api.contentstack.io/v3/content_types/?include_global_field_schema=${includeGlobalFieldSchema}`;
  const stackdata = await getStackInfo();
  console.log("stackdata",stackdata);
  const response = await fetch(url, {
    headers: {
      api_key: stackdata?.apiKey!,
      authorization: stackdata?.cmaToken!,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching content types: ${response.statusText}`);
  }

  const data = await response.json();

  return data.content_types;
}

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

export async function getContentType(contentType: string) {
  console.log("Inside getContentType function with contentType:", contentType);
  try {
    const content_types = await getContentTypes({
      includeGlobalFieldSchema: true,
    });

    const pageContentTypes = content_types.filter(
      (ct: any) => ct.uid == contentType
    );
    const resolvedEntries = await Promise.all(
      pageContentTypes.map((entry: any) => resolveNestedEntry(entry))
    );

    return resolvedEntries;
  } catch (err) {
    console.error("❌ Error fetching entries:", err);
    return [];
  }
}
