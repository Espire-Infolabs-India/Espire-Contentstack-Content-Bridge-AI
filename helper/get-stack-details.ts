export type SafeStackInfo = {
  stackname: string;
  apiKey: string;
  branch: string;
  org_uid?: string;
  owner_uid?: string;
  cmaToken?: string;
  deliveryToken?: string;
  appRegion?: string;
};

export const getStackInfo = async (): Promise<SafeStackInfo | null> => {
  if (typeof window !== "undefined") {
    console.warn("getSafeStackInfo called on server skipping SDK init");
  }
  try {
    const ContentstackAppSdk = (await import("@contentstack/app-sdk")).default;
    const sdk: any = await ContentstackAppSdk.init();

    const currentBranch = sdk?.stack?._currentBranch || {};
    const data = sdk?.stack?._data || {};
    const config = (await sdk.getConfig?.()) || {};

    return {
      stackname: data.name || "",
      apiKey: currentBranch.api_key || "",
      branch: currentBranch.uid || "",
      org_uid: data.org_uid || "",
      owner_uid: data.owner_uid || "",
      cmaToken: config?.cmaToken || "",
      deliveryToken: config?.deliveryToken || "",
      appRegion: config?.appRegion || "",
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
