// helper/getConfigFromJwt.ts
import { jwtDecode } from "jwt-decode";

export interface ContentstackConfig {
  apiKey: string;
  deliveryToken: string;
  cmaToken?: string;
  environment: string;
  customBotEndpoint?: string;
  customBotApiKey?: string;
  geminiApiKey?: string;
  openAiApiKey?: string;
  baseUrl?: string;
}

export function getConfigFromJwt(jwt: string): ContentstackConfig {
  const decoded = jwtDecode<any>(jwt); // adapt type if needed

  return {
    apiKey: decoded.apiKey || decoded.cmaToken || "",
    deliveryToken: decoded.deliveryToken || "",
    cmaToken: decoded.cmaToken || "",
    environment: decoded.appRegion || "staging",
    customBotEndpoint: decoded.customBotEndpoint,
    customBotApiKey: decoded.customBotApiKey,
    geminiApiKey: decoded.geminiApiKey,
    openAiApiKey: decoded.openAiApiKey,
    baseUrl: decoded.baseUrl || "",
  };
}
