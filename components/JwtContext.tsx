import React, { createContext, useContext, useEffect, useState } from "react";
import { getStackInfo, SafeStackInfo } from "../helper/get-stack-details";

interface JwtContextProps {
  jwt: string | null;
  loading: boolean;
  stackInfo: SafeStackInfo | null;
}

const JwtContext = createContext<JwtContextProps>({
  jwt: null,
  loading: true,
  stackInfo: null,
});

export const JwtProvider = ({ children }: { children: React.ReactNode }) => {
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stackInfo, setStackInfo] = useState<SafeStackInfo | null>(null);

  const fetchJwt = async () => {
    try {
      const stack = await getStackInfo();
      if (!stack) {
        console.error("Failed to get stack info");
        return;
      }

      setStackInfo(stack);

      if (!stack.cmaToken || !stack.deliveryToken) {
        console.error("Stack config incomplete", stack);
        return;
      }
      console.log("Stack info:", stack);

      const resp = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgUid: stack.org_uid,
          ownerUid: stack.owner_uid,
          branch: stack.branch,
          apiKey: stack.apiKey,
          stackname: stack.stackname,
          cmaToken: stack.cmaToken,
          deliveryToken: stack.deliveryToken,
          appRegion: stack.appRegion,
        }),
      });

      const { token } = await resp.json();
      setJwt(token);

      // Refresh JWT before expiry
      setTimeout(fetchJwt, 55 * 60 * 1000);
    } catch (err) {
      console.error("JWT fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJwt();
  }, []);

  return (
    <JwtContext.Provider value={{ jwt, loading, stackInfo }}>
      {children}
    </JwtContext.Provider>
  );
};

export const useJwt = () => useContext(JwtContext);
