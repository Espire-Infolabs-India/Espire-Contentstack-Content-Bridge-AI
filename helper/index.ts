import { addEditableTags } from "@contentstack/utils";
import { Page, BlogPosts } from "../typescript/pages";
import getConfig from "next/config";
import { FooterProps, HeaderProps } from "../typescript/layout";
import contentstackSdk from "../contentstack-sdk";

const getEntry = contentstackSdk.getEntry;
const getEntryByUrl = contentstackSdk.getEntryByUrl;

const { publicRuntimeConfig } = getConfig();
const envConfig = process.env.CONTENTSTACK_API_KEY
  ? process.env
  : publicRuntimeConfig;

const liveEdit = envConfig.CONTENTSTACK_LIVE_EDIT_TAGS === "true";

export const getHeaderRes = async (): Promise<HeaderProps> => {
  const response = (await getEntry({
    contentTypeUid: "header",
    referenceFieldPath: ["navigation_menu.page_reference"],
    jsonRtePath: ["notification_bar.announcement_text"],
  })) as HeaderProps[][];

  liveEdit && addEditableTags(response[0][0], "header", true);

  return response[0][0];
};

export const getFooterRes = async (): Promise<FooterProps> => {
  const response = (await getEntry({
    contentTypeUid: "footer",
    referenceFieldPath: undefined,
    jsonRtePath: ["copyright"],
  })) as FooterProps[][];
  liveEdit && addEditableTags(response[0][0], "footer", true);

  return response[0][0];
};

export const getAllEntries = async (): Promise<Page[]> => {
  const response = (await getEntry({
    contentTypeUid: "page",
    referenceFieldPath: undefined,
    jsonRtePath: undefined,
  })) as Page[][];
  liveEdit &&
    response[0].forEach((entry) => addEditableTags(entry, "page", true));

  return response[0];
};

export const getPageRes = async (entryUrl: string): Promise<Page> => {
  const response = (await getEntryByUrl({
    contentTypeUid: "page",
    entryUrl,
    referenceFieldPath: ["page_components.from_blog.featured_blogs"],
    jsonRtePath: [
      "page_components.from_blog.featured_blogs.body",
      "page_components.section_with_buckets.buckets.description",
      "page_components.section_with_html_code.description",
    ],
  })) as Page[];
  liveEdit && addEditableTags(response[0], "page", true);
  return response[0];
};

export const getBlogListRes = async (): Promise<BlogPosts[]> => {
  const response = (await getEntry({
    contentTypeUid: "blog_post",
    referenceFieldPath: ["author", "related_post"],
    jsonRtePath: ["body"],
  })) as BlogPosts[][];
  liveEdit &&
    response[0].forEach((entry) => addEditableTags(entry, "blog_post", true));
  return response[0];
};

export const getBlogPostRes = async (entryUrl: string): Promise<BlogPosts> => {
  const response = (await getEntryByUrl({
    contentTypeUid: "blog_post",
    entryUrl,
    referenceFieldPath: ["author", "related_post"],
    jsonRtePath: ["body", "related_post.body"],
  })) as BlogPosts[];
  liveEdit && addEditableTags(response[0], "blog_post", true);
  return response[0];
};

const urlcontent = {
  base_url: "cdn.contentstack.io",
};

const headers: Record<string, string> = {};
if (process.env.NEXT_PUBLIC_CONTENT_KEY) {
  headers["api_key"] = process.env.NEXT_PUBLIC_CONTENT_KEY;
}
if (process.env.NEXT_PUBLIC_ACCESS_TOKEN) {
  headers["access_token"] = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
}

export const GetProductDetailData = async (
  content_type_uid: string,
  entry_uid: string
) => {
  let ApiData = await fetch(
    `https://${urlcontent.base_url}/v3/content_types/${content_type_uid}/entries/${entry_uid}?include[]=image_carrousel&include[]=features_icons_with_short_text`,
    {
      method: "GET",
      headers: headers,
    }
  );
  let ApiData_ = await ApiData.json();
  return ApiData_.entry;
};

export const getHeaderResponse = async (
  contentTypeUid: string,
  entryUid: string
) => {
  try {
    const response = await fetch(
      `https://${urlcontent.base_url}/v3/content_types/${contentTypeUid}/entries/${entryUid}?environment=dxastaging`,
      {
        method: "GET",
        headers: headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data.entry;
  } catch (error) {
    console.error("Error fetching footer data:", error);
    return null; // or throw, based on your needs
  }
};

export const GetSupportBannerData = async (
  content_type_uid: string,
  entry_uid: string
) => {
  let ApiData = await fetch(
    `https://${urlcontent.base_url}/v3/content_types/${content_type_uid}/entries/${entry_uid}`,
    {
      method: "GET",
      headers: headers,
    }
  );
  let ApiData_ = await ApiData.json();
  return ApiData_.entry;
};