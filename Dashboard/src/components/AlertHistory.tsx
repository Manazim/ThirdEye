import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import '../App.css';
import { useNavigate } from 'react-router-dom';

interface AlertData {
  Message: string; // Corrected the field name
  TimeStamp: string; // Corrected the field name
}

const AlertHistory = () => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const navigate = useNavigate();

  // Fetch alert data from the API
  const fetchAlertData = async () => {
    try {
      const response = await axios.get('http://localhost:3001/alertsHistory'); // Adjust the endpoint if needed
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alert data:', error);
    }
  };

  useEffect(() => {
    fetchAlertData();
  }, []);

  const formatTimestamp = (timeStamp: string) => {
    return moment(timeStamp).format('MM/DD/YYYY h:mm A');
  };

  return (
    <div className="app-container">
      <div className="header-container">
        <div className="back-icon" onClick={() => navigate('/Home')}>
          <span>Back to Home</span>
        </div>
        <h1>Alert History</h1>
      </div>

      <div className="alert-list">
        {alerts.length > 0 ? (
          alerts.map((alert, index) => (
            <div className="alert-item" key={index}>
              <p className="alert-message">
                {alert.Message} {/* Use the correct field name */}
              </p>
              <p className="alert-timestamp">
                {formatTimestamp(alert.TimeStamp)} {/* Use the correct field name */}
              </p>
            </div>
          ))
        ) : (
          <p>No alerts available.</p>
        )}
      </div>
    </div>
  );
};

export default AlertHistory;
