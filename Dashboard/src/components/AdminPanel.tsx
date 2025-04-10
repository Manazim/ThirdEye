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

const AdminPanel = () => {
  const [device, setDevice] = useState("");
  const [password, setPassword] = useState("");
  const [chat, setChat] = useState("");

  const [message, setMessage] = useState("");
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/AddUser", {
        Device: device,
        Password: password,
        Chat: chat,
      });

      if (response.data.success) {
        setMessage("User added successfully");
      } else {
        setMessage("Succesfully Added");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error, please try again");
    }
  };

  return (
    <div className="form-container">
       <div className="back-icon" onClick={() => navigate('/loginAD')}>
        <span style={{ color: 'gold' }}>← Back to Home</span>
      </div>
      <h2 style={{ color: "white", textAlign: "center" }}>Add User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="device">Device</label>
          <input
            type="text"
            id="device"
            name="device"
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            placeholder="Enter device name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="chat">Chat ID</label>
          <input
            type="text"
            id="chat"
            name="chat"
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            placeholder="Enter Chat ID"
            required
          />
        </div>

        <button type="submit">Add User</button>
      </form>

      {message && <p style={{ color: "white", textAlign: "center", marginTop: "15px" }}>{message}</p>}
    </div>
  );
};

export default AdminPanel;
