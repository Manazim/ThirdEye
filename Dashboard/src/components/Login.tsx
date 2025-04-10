import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const Login = ({ setIsAuthenticated }: { setIsAuthenticated: (auth: boolean) => void }) => {
  const [Device, setDevice] = useState('');
  const [Password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { Device, Password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);
        navigate('/Home');
      } else {
        setMessage('Invalid credentials');
      }
    } catch (error) {
      setMessage('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Login to access your account</p>

          <div className="input-group">
            <label>Device Name</label>
            <input
              type="text"
              placeholder="Enter Device name"
              value={Device}
              onChange={(e) => setDevice(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          <a href="/LoginAD" className="login-subtitle">Login as Admin</a>

          {message && <p className="login-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
