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
