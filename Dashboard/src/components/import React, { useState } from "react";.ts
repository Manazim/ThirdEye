import React, { useState } from "react";
import JamAI from "jamaibase";

const HealthMonitor = () => {
  const [analysisOutput, setAnalysisOutput] = useState(null);

  const handleAnalyzeClick = async () => {
    try {
      // Initialize JamAI client with correct API key and project ID
      const jamai = new JamAI({
        token: "jamai_sk_fe480cff5e51d9a9ed27d5aed49711a478d340e0cabfa591", // Your actual API key
        projectId: "proj_b94ddb2a281eef887d90264a", // Correct Project ID, not the same as API key
        dangerouslyAllowBrowser: true,
      });

      // Make API call to add a row to the table
      const response = await jamai.table.addRow({
        table_type: "action",               // Table type is "action"
        table_id: "Analyze",                // Ensure the table ID is correct (without any extra spaces)
        data: [
          {
            Data1: "30", // Example data to be added
            Data2: "170",
            Data3: "60",
            Data4: "56",
            Data5: "56",
            Data6: "56",
            Data7: "56",
            Data8: "56",
            Data9: "56",
            Data10: "56",
          },
        ],
        reindex: null,                      // Optional: reindexing behavior, leave as null for now
        concurrent: false                   // Optional: whether this operation should be concurrent, leave as false
      });

      console.log("Response from JamAI: ", response); // Log the response

      // Optionally update the UI with the response
      setAnalysisOutput(response);
    } catch (err: any) {
      console.error("Error adding row to JamAI:", err.message); // Catch any errors and log them
    }
  };

  return (
    <div>
      <button onClick={handleAnalyzeClick}>Analyze</button>
      {analysisOutput && (
        <div>
          <h2>Response from JamAI:</h2>
          <pre>{JSON.stringify(analysisOutput, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HealthMonitor;
