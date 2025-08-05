import { Config, Region, LivePreview, Stack } from "contentstack";
import getConfig from "next/config";
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
  CONTENTSTACK_PREVIEW_TOKEN,
  CONTENTSTACK_PREVIEW_HOST,
  CONTENTSTACK_APP_HOST,
  CONTENTSTACK_LIVE_PREVIEW,
} = envConfig;


export const isBasicConfigValid = () => {
  return (
    !!CONTENTSTACK_API_KEY &&
    !!CONTENTSTACK_DELIVERY_TOKEN &&
    !!CONTENTSTACK_ENVIRONMENT
  );
};

export const isLpConfigValid = () => {
  return (
    !!CONTENTSTACK_LIVE_PREVIEW &&
    !!CONTENTSTACK_PREVIEW_TOKEN &&
    !!CONTENTSTACK_PREVIEW_HOST &&
    !!CONTENTSTACK_APP_HOST
  );
};

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

// contentstack sdk initialization
export const initializeContentStackSdk = (): Stack => {
  if (!isBasicConfigValid())
    throw new Error("Please set you .env file before running starter app");
  const stackConfig: Config = {
    api_key: CONTENTSTACK_API_KEY as string,
    delivery_token: CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: CONTENTSTACK_ENVIRONMENT as string,
    region: setRegion(),
    branch: CONTENTSTACK_BRANCH || "main",
  };
 
  return Stack(stackConfig);
};


// generate prod api urls
export const generateUrlBasedOnRegion = (): string[] => {
  return Object.keys(Region).map((region) => {
    if (region === "US") {
      return `cdn.contentstack.io`;
    }
    return `${region}-cdn.contentstack.com`;
  });
};
