import React, { useState, useEffect } from 'react';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import { FaMapMarkedAlt, FaHeartbeat, FaCamera } from "react-icons/fa";

import OxygenIcon from '/Users/user/Desktop/fyp/src/oxygen-saturation.png';
import BloodPressureIcon from '/Users/user/Desktop/fyp/src/blood-pressure.png';
import FallStatusIcon from '/Users/user/Desktop/fyp/src/falling-down.png';
import LocIcon from '/Users/user/Desktop/fyp/src/location-pin.png';


function Home() {

  const navigate = useNavigate();

  // State for health data
  const [sensor, setHealthData] = useState({
    BloodPressure: 0,
    OxygenLevel: 0,
    updated: '',
  });

  // State for location data
  const [location, setLocation] = useState([]);

  // State for fall info
  const [freefall, setFreeFall] = useState({
    status: 'true',
  });

  // State for sliding panel visibility
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  // Fetch health data from API
  const fetchHealthData = async () => {
    try {
      const response = await fetch("http://localhost:3001/SensorValue");
      const data = await response.json();
      setHealthData({
        OxygenLevel: data[0].OxygenLevel,
        BloodPressure: data[0].BloodPressure,
        updated: new Date().toLocaleTimeString(),
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  };

  // Fetch status
  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:3001/FreeFall");
      const data = await response.json();
      const fallStatus = data[0].fallstatus ? 'true' : 'false';
      setFreeFall({ status: fallStatus });
    } catch (error) {
      console.error('Error fetching status data:', error);
    }
  };

  // Polling for health and status data
  useEffect(() => {
    fetchHealthData();
    const healthInterval = setInterval(fetchHealthData, 300000); // 5 minutes
    return () => clearInterval(healthInterval);
  }, []);

  useEffect(() => {
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 300000); // 5 minutes
    return () => clearInterval(statusInterval);
  }, []);

  // Fetch location data from API
  useEffect(() => {
    fetch('http://localhost:3001/Curlocation')
      .then(response => response.json())
      .then(data => setLocation(data))
      .catch(err => console.error('Error fetching location data:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  }
  

  return (
    <div className="app-container">
      <header className="app-header">
      <div className='Panel-div'>

        <button
          className="toggle-panel-btn"
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          {isPanelVisible ? 'Close Panel' : 'Open Panel'}
        </button>
        </div>
        <h1>Third Eye</h1>
        <p>Your safety, our priority</p>
        <nav className="fancy-nav">
          <Link to="/LocationHistory" className="nav-link">
            <FaMapMarkedAlt /> Location History
          </Link>
          <Link to="/HealthMonitor" className="nav-link">
            <FaHeartbeat /> Health Monitor
          </Link>
          <Link to="/Stream" className="nav-link">
            <FaCamera /> Live Stream
          </Link>
        </nav>
      </header>
      <main className="app-main">
        {isPanelVisible && (
          <div className="sliding-panel">

<div>
  <h3>Device Information</h3>
  <p>Device Name: X123456</p>
  <p>Name: Sifulan Bin Sifulan</p>
  <p>User Disability: Visual Impaired</p>
  <p>Chat ID: Group_001</p>

  <div className="logout-container">
    <button className="logout-btn" onClick={handleLogout}>
      Logout
    </button>
  </div>
</div>

          </div>
          
        )}
        <section className="status-section">
  <h2>Real-time Monitor</h2>
  
  <div className="status-box-container">
    <div className="status-box left">
      <img src={BloodPressureIcon} alt="Blood Pressure" className="status-icon" />

      <p className="status-text">Heart Rate: <span className="value-text">{sensor.BloodPressure}</span></p>
    </div>

    <div className="status-box right">
    <img src={OxygenIcon} alt="Oxygen Level" className="status-icon" />
      <p className="status-text">Oxygen Lvl: <span className="value-text">{sensor.OxygenLevel} </span> </p>
    </div>
  </div>
  
  <div className="status-box middle">
  <img src={FallStatusIcon} alt="Fall Event" className="status-icon" />

    <p className="status-text"> Fall Status: <span className="stat-text">{freefall.status} </span></p>
  </div>

  <p className="last-updated">
  Last Updated: 
  <span className="update-time">{sensor.updated}</span>
</p>
</section>

        <section className="location-section">

          <div>
          <img src={LocIcon} alt="Fall Event" className="loc-icon" />
          <h2>Current Location</h2>


          </div>
          {location.map((loc, index) => (
            <React.Fragment key={`location-${index}`}>
              <iframe
                style={{ border: '5px solid #FFD700' }}
                width="300"
                height="350"
                src={`https://www.google.com/maps?q=${loc.Latitude},${loc.Longitude}&output=embed`}
                allowFullScreen
                title={`map-${index}`}
              ></iframe>
            </React.Fragment>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Home;
