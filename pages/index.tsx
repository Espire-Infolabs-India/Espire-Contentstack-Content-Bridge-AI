import React, { useState, useEffect } from "react";
import { getStackInfo, SafeStackInfo } from "../helper/get-stack-details";
import GenerateContent from "../components/GenerateContent";

export default function Home() {
  const [stackData, setStackData] = useState<SafeStackInfo | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const run = async () => {
      const data = await getStackInfo();
      if (data) {
        console.log("stackdata", data);
        setStackData(data);

        try {
          const response = await fetch("/api/set-stack-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            console.log("✅ Stack info posted successfully");
            setIsDataLoaded(true);
          } else {
            console.error("❌ Failed to post stack info:", response.statusText);
          }
        } catch (err) {
          console.error("❌ Error posting stack info:", err);
        }
      }
    };

    run();
  }, []);

  return (
    <>

      <GenerateContent isDataLoaded={isDataLoaded} />
    </>
  );
}
