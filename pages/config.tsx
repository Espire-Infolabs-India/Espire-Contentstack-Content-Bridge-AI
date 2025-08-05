import React from "react";
import { useInitConfig } from "../helper/use-app-config";

export default function ConfigScreen() {
  const {
    cmaToken,
    deliveryToken,
    appRegion,
    loading,
    error,
    setCmaToken,
    setDeliveryToken,
    setAppRegion,
  } = useInitConfig();

  if (error)
    return <div style={{ padding: "2rem", color: "red" }}>{error}</div>;
  if (loading)
    return <div style={{ padding: "2rem" }}>Loading configuration...</div>;

  return (
    <div
      style={{ padding: "1.5rem", fontFamily: "sans-serif", maxWidth: "400px" }}
    >
      <h2>App Configuration</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label>CMA Token:</label>
        <input
          type="text"
          value={cmaToken}
          onChange={(e) => setCmaToken(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Delivery Token:</label>
        <input
          type="text"
          value={deliveryToken}
          onChange={(e) => setDeliveryToken(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>Enter you region :</label>
        <input
          type="text"
          value={appRegion}
          onChange={(e) => setAppRegion(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>
    </div>
  );
}