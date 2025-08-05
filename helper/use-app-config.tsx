import { useEffect, useState } from "react";

export interface AppConfigState {
  cmaToken: string;
  deliveryToken: string;
  loading: boolean;
  error: string | null;
  appRegion: string;
  setCmaToken: (val: string) => void;
  setDeliveryToken: (val: string) => void;
  setAppRegion: (val: string) => void;
  sdkRef: unknown;
}

export const useInitConfig = (): AppConfigState => {
  const [cmaToken, setCmaToken] = useState("");
  const [appRegion, setAppRegion] = useState("us");
  const [deliveryToken, setDeliveryToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkRef, setSdkRef] = useState<unknown>(null);

  useEffect(() => {
    const initSdk = async () => {
      try {
        if (typeof globalThis === "undefined") return;
        const sdkModule = await import("@contentstack/app-sdk");
        const sdk: any = await sdkModule.default.init();
        setSdkRef(sdk);

        const appConfigLocation = sdk?.location?.AppConfigWidget;

        if (
          !appConfigLocation ||
          !appConfigLocation.installation?.getInstallationData
        ) {
          setError("Not inside App Configuration location.");
          return;
        }

        const existing =
          await appConfigLocation.installation.getInstallationData();
        setCmaToken(existing?.configuration?.cmaToken || "");
        setDeliveryToken(existing?.configuration?.deliveryToken || "");
        setAppRegion(existing?.configuration?.appRegion || "");

        if (typeof (appConfigLocation as any).setReady === "function") {
          (appConfigLocation as any).setReady();
        }

        setLoading(false);
      } catch (err) {
        console.error("SDK Init Error:", err);
        setError("SDK initialization failed.");
        setLoading(false);
      }
    };

    initSdk();
  }, []);

  useEffect(() => {
    const updateInstallationData = async () => {
      const appConfigLocation = (sdkRef as any)?.location?.AppConfigWidget
        ?.installation;
      if (appConfigLocation?.setInstallationData) {
        await appConfigLocation.setInstallationData({
          configuration: {
            cmaToken,
            deliveryToken,
            appRegion,
          },
          isValid: true,
        });
      }
    };

    if (sdkRef) {
      updateInstallationData();
    }
  }, [cmaToken, deliveryToken, appRegion, sdkRef]);

  return {
    cmaToken,
    deliveryToken,
    appRegion,
    loading,
    error,
    setCmaToken,
    setDeliveryToken,
    setAppRegion,
    sdkRef,
  };
};
