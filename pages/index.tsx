import React from "react";
import GenerateContent from "../components/GenerateContent";
import { useJwt } from "../components/JwtContext";

export default function Home() {
  const { jwt, loading } = useJwt();
  return (
    <div style={{ padding: "20px" }}>
      {!loading && jwt && <GenerateContent isDataLoaded={true} jwt={jwt} />}
      {!loading && !jwt && <p>Failed to fetch data. Check App SDK console.</p>}
    </div>
  );
}
