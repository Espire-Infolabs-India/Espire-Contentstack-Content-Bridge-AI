import * as Utils from "@contentstack/utils";
import ContentstackLivePreview from "@contentstack/live-preview-utils";
import getConfig from "next/config";
import {
  customHostUrl,
  initializeContentStackSdk,
  isValidCustomHostUrl,
} from "./utils";
import axios from "axios";

type GetEntry = {
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

type GetEntryByUrl = {
  entryUrl: string | undefined;
  contentTypeUid: string;
  referenceFieldPath: string[] | undefined;
  jsonRtePath: string[] | undefined;
};

const { publicRuntimeConfig } = getConfig();
const envConfig = process.env.CONTENTSTACK_API_KEY
  ? process.env
  : publicRuntimeConfig;

let customHostBaseUrl = envConfig.CONTENTSTACK_API_HOST as string;
customHostBaseUrl = customHostBaseUrl ? customHostUrl(customHostBaseUrl) : "";

// SDK initialization
const Stack = initializeContentStackSdk();

// set host url only for custom host or non prod base url's
if (customHostBaseUrl && isValidCustomHostUrl(customHostBaseUrl)) {
  Stack.setHost(customHostBaseUrl);
}

// Setting LP if enabled
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

export default {
  /**
   *
   * fetches all the entries from specific content-type
   * @param {* content-type uid} contentTypeUid
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   *
   */

  // Utility to get reference fields from content type schema

  getEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }: GetEntry) {
    return new Promise((resolve, reject) => {
      const query = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) query.includeReference(referenceFieldPath);
      query
        .toJSON()
        .find()
        .then(
          (result) => {
            jsonRtePath &&
              Utils.jsonToHTML({
                entry: result,
                paths: jsonRtePath,
                renderOption,
              });
            resolve(result);
          },
          (error) => {
            reject(error);
          }
        );
    });
  },

  /**
   *fetches specific entry from a content-type
   *
   * @param {* content-type uid} contentTypeUid
   * @param {* url for entry to be fetched} entryUrl
   * @param {* reference field name} referenceFieldPath
   * @param {* Json RTE path} jsonRtePath
   * @returns
   */
  getEntryByUrl({
    contentTypeUid,
    entryUrl,
    referenceFieldPath,
  }: // jsonRtePath,
  GetEntryByUrl) {
    return new Promise((resolve, reject) => {
      const blogQuery = Stack.ContentType(contentTypeUid).Query();
      if (referenceFieldPath) blogQuery.includeReference(referenceFieldPath);
      blogQuery.toJSON();
      const data = blogQuery.where("url", `${entryUrl}`)?.find();
      data.then(
        (result) => {
          // jsonRtePath &&
          //   Utils.jsonToHTML({
          //     entry: result,
          //     paths: jsonRtePath,
          //     renderOption,
          //   });
          resolve(result[0]);
        },
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });
  },
};

export async function getEntryByUid(contentTypeUid:any, entryUid:any) {
  try {
    const entry = await Stack.ContentType(contentTypeUid)
      .Entry(entryUid)
      .toJSON()
      .fetch();
    return entry;
  } catch (error) {
    console.error(
      `❌ Error fetching entry [${entryUid}] from [${contentTypeUid}]`,
      error
    );
    throw error;
  }
}

export async function executeGraphQLQuery(graphQLQuery:any) {
  const API_KEY = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY;
  const DELIVERY_TOKEN = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN;
  const ENVIRONMENT = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT;
  if (!API_KEY || !DELIVERY_TOKEN || !ENVIRONMENT) {
    throw new Error("Missing Contentstack env variables");
  }

  const graphqlEndpoint = `https://graphql.contentstack.com/stacks/${API_KEY}?environment=${ENVIRONMENT}`;

  const query = graphQLQuery;

  try {
    const response = await axios.post(
      graphqlEndpoint,
      { query },
      {
        headers: {
          access_token: DELIVERY_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "GraphQL fetch failed:",
      error.response?.data || error.message
    );
    throw error;
  }
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

export async function getAllContentTypes() {
  try {
    const contentTypes = await Stack.getContentTypes({
      include_global_field_schema: true,
    });

    return contentTypes;
  } catch (err) {
    console.error("❌ Error fetching entries:", err);
    return [];
  }
}

export async function getContentType(contentType: string) {
  try {
    const { content_types } = await Stack.getContentTypes({
      include_global_field_schema: true,
    });
 
    const pageContentTypes = content_types.filter((ct: any) =>
      ct.uid == contentType
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