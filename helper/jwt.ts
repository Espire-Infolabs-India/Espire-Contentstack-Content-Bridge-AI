import jwt from "jsonwebtoken";
import crypto from "crypto";

// Store secret globally per deployment/runtime
const GLOBAL_KEY = "__MARKETPLACE_JWT_SECRET__" as const;

if (!(GLOBAL_KEY in globalThis)) {
  // Generate once per deployment/runtime
  (globalThis as any)[GLOBAL_KEY] = crypto.randomBytes(64).toString("hex");
  console.log(
    "🔑 Marketplace JWT secret generated for this deployment:",
    (globalThis as any)[GLOBAL_KEY]
  );
}

const getSecret = () => (globalThis as any)[GLOBAL_KEY];

export const issueJwt = (payload: object) => {
  return jwt.sign(payload, getSecret(), { expiresIn: "1h" });
};

export const verifyJwt = <T = any>(token: string): T => {
  return jwt.verify(token, getSecret()) as T;
};


export const decodeJwt = <T = any>(token: string): T | null => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);
    return JSON.parse(decoded) as T;
  } catch (err) {
    console.error("❌ JWT decode failed:", err);
    return null;
  }
};