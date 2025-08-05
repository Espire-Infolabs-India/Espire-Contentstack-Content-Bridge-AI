import React, { useState, useEffect } from "react";
import GenerateContent from "../components/GenerateContent";
import { getStackInfo, SafeStackInfo } from "../helper/get-stack-details";

export default function Home() {
  const [stackData, setStackData] = useState<SafeStackInfo | null>(null);

  useEffect(() => {
    const run = async () => {
      const data = await getStackInfo();
      if (data) {
        setStackData(data);
      }
    };
    run();
  }, []);

  return (
    <>
      {stackData && (
        <>
          <h3>Stack Name: {stackData.stackname}</h3>
          <h3>API Key: {stackData.apiKey}</h3>
          <h3>Branch: {stackData.branch}</h3>
          <h3>CMA TOKEN: {stackData.cmaToken}</h3>
          <h3>Delivery Token: {stackData.deliveryToken}</h3>
          <h3>Org UID: {stackData.org_uid}</h3>
          <h3>Owner UID: {stackData.owner_uid}</h3>
        </>
      )}
      <GenerateContent />
    </>
  );
}
