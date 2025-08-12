import { Config, Region, LivePreview, Stack } from "contentstack";
import getConfig from "next/config";
import { getStackInfo } from "../helper/get-stack-details";
const { publicRuntimeConfig } = getConfig();
const envConfig = process.env.CONTENTSTACK_API_KEY
  ? process.env
  : publicRuntimeConfig;

const {
  CONTENTSTACK_API_KEY,
  CONTENTSTACK_DELIVERY_TOKEN,
  CONTENTSTACK_ENVIRONMENT,
  CONTENTSTACK_BRANCH,
  CONTENTSTACK_REGION,
} = envConfig;

const setRegion = (): Region => {
  let region = "US" as keyof typeof Region;
  if (!!CONTENTSTACK_REGION && CONTENTSTACK_REGION !== "us") {
    region = CONTENTSTACK_REGION.toLocaleUpperCase().replace(
      "-",
      "_"
    ) as keyof typeof Region;
  }
  return Region[region];
};

export const initializeContentStackSdk = (): Stack => {
  const stackConfig: Config = {
    api_key: CONTENTSTACK_API_KEY as string,
    delivery_token: CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: CONTENTSTACK_ENVIRONMENT as string,
    region: setRegion(),
    branch: CONTENTSTACK_BRANCH || "main",
  };

  return Stack(stackConfig);
};

export const customHostUrl = (baseUrl: string): string => {
  return baseUrl.replace("api", "cdn");
};

export const generateUrlBasedOnRegion = (): string[] => {
  return Object.keys(Region).map((region) => {
    if (region === "US") {
      return `cdn.contentstack.io`;
    }
    return `${region}-cdn.contentstack.com`;
  });
};

export const isValidCustomHostUrl = (url = ""): boolean => {
  return url ? !generateUrlBasedOnRegion().includes(url) : false;
};
