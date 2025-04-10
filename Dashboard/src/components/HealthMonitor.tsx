import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import JamAI from "jamaibase";
import 'font-awesome/css/font-awesome.min.css';
import { newDate } from 'react-datepicker/dist/date_utils';
import RepIcon from '/Users/user/Desktop/fyp/src/report.png';




const HealthMonitor = () => {
  const [sensorData, setSensorData] = useState([]);
  const [analysisOutput, setAnalysisOutput] = useState(null); // State to store analysis results
  const navigate = useNavigate();
  

  // Fetch sensor data from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/HealthMonitor');
      const cleanedData = response.data.map((data) => ({
        ...data,
        BloodPressure: data["BloodPressure"] || data.BloodPressure,
        OxygenLevel: data["OxygenLevel"] || data.OxygenLevel,
      }));
      setSensorData(cleanedData);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  // Get the current date
const now = new Date();

// Define an array with day names
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Format the date
const dayOfWeek = daysOfWeek[now.getDay()]; // Get the day of the week (e.g., "Sun")
const month = String(now.getMonth() + 1).padStart(2, '0'); // Get the month (e.g., "01")
const day = String(now.getDate()).padStart(2, '0'); // Get the day of the month (e.g., "12")
const year = now.getFullYear(); // Get the year (e.g., "2025")

// Create the formatted date string
const formattedDate = `${dayOfWeek}_${month}${day}${year}`;

  //call backend to generate report
  const handlereport = async () => {

    try {
      const response = await axios.get('http://localhost:3001/generateReport', {
        responseType: 'blob', // Important for downloading files
      });
  
      // Create a download link for the CSV file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formattedDate}-HealthReport.csv`); // Filename with timestamp
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };
  
  // Call backend to perform analysis
  const handleAnalyze = async () => {
    try {
      const getdata = await axios.get('http://localhost:3001/HealthMonitor'); // Call the /analyze endpoint
      const combinedData = getdata.data.map((data) => ({
        BloodPressure: data["BloodPressure"] || data.BloodPressure,
        OxygenLevel: data["OxygenLevel"] || data.OxygenLevel,
      }));
  
      // Log the combined data to verify it's populated correctly
      console.log("Combined Data:", combinedData);
  
      const jamai = new JamAI({
        token: "jamai_sk_fe480cff5e51d9a9ed27d5aed49711a478d340e0cabfa591", // Your actual API key
        projectId: "proj_b94ddb2a281eef887d90264a", // Correct Project ID, not the same as API key
        dangerouslyAllowBrowser: true,
      });
  
      const response = await jamai.table.addRow({
        table_type: "action",               // Table type is "action"
        table_id: "Analyze",                // Ensure the table ID is correct (without any extra spaces)
        data: [
          {
            Data1: JSON.stringify(combinedData[0]), // Example data to be added
            Data2: JSON.stringify(combinedData[1]),
            Data3: JSON.stringify(combinedData[2]),
            Data4: JSON.stringify(combinedData[3]),
            Data5: JSON.stringify(combinedData[4]),
            Data6: JSON.stringify(combinedData[5]),
            Data7: JSON.stringify(combinedData[6]),
            Data8: JSON.stringify(combinedData[7]),
            Data9: JSON.stringify(combinedData[8]),
            Data10: JSON.stringify(combinedData[9]),
          },
        ],
        reindex: null,                      // Optional: reindexing behavior, leave as null for now
        concurrent: false                   // Optional: whether this operation should be concurrent, leave as false
      });
  
      console.log("Response from JamAI: ", response);
  
      // Assuming the response from JamAI contains analysis data, set the output to `analysisOutput`
      // Adjust this based on what the response actually contains
      setAnalysisOutput(response.rows[0].columns.Result.choices[0].message.content);  // or whatever field from the response that contains the analysis results
  
    } catch (error) {
      console.error('Error during analysis:', error);
      setAnalysisOutput('An error occurred while analyzing the data.');
    }
  };
  

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 60000); // Refresh data every 1 minute
    return () => clearInterval(intervalId);
  }, []);

  // Prepare chart data for Recharts
  const chartData = sensorData.map((data) => ({
    time: new Date(data.timestamp).toLocaleTimeString(),
    heartRate: data.BloodPressure,
    oxygenLevel: data.OxygenLevel,
  }));

  return (
    <div className="app-container">
     <div className="back-icon" onClick={() => navigate('/Home')}>
  <i className="fas fa-home back-icon-inner"></i>
  <span className="back-text">Back to Home</span>
</div>

<div className='genbut-div'>
  <button onClick={handlereport} className="generate-button">
    <img src={RepIcon} alt="Report" className="status-icon-rep" />
    Generate Report
  </button>
</div>


      <h1 className="HealthMonitorTitle">Health Monitoring</h1>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
            <XAxis dataKey="time" tick={{ fill: '#fff' }} />
            <YAxis tick={{ fill: '#fff' }} domain={[80, 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
            <Legend verticalAlign="top" align="right" wrapperStyle={{ color: '#fff' }} />
            <ReferenceLine y={120} stroke="red" strokeDasharray="3 3" label="Critical HR" />
            <ReferenceLine y={90} stroke="blue" strokeDasharray="3 3" label="Low HR" />
            <Line
              type="monotone"
              dataKey="heartRate"
              stroke="#FF6384"
              strokeWidth={3}
              dot={{ stroke: '#FF6384', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="oxygenLevel"
              stroke="#36A2EB"
              strokeWidth={3}
              dot={{ stroke: '#36A2EB', strokeWidth: 2 }}
            />
            <Brush dataKey="time" height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

    
<div className='analyze-title'>      
  <p>Analyze for the past 10 readings</p>
</div>
      <div className="analysis-container">
        <button onClick={handleAnalyze} className="analyze-button">Analyze</button>
       {analysisOutput && (

        <div className="analysis-output">
          <h2>Analysis Output:</h2>
          <pre>{JSON.stringify(analysisOutput, null, 2)}</pre>
        </div>
        )}
      </div>
      
    </div>
  );
};

export default HealthMonitor;
