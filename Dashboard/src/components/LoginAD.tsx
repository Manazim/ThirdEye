import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const LoginAD = ({ setIsAuthenticated }: { setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [Username, setDevice] = useState('');
  const [Password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // Loading state to manage loading spinner
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);  // Start loading spinner

    try {
      const response = await axios.post('http://localhost:3001/loginAD', { Username, Password });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        setIsAuthenticated(true);  // Update authentication state in App.tsx
        navigate('/AdminPanel');  // Navigate to Home page after successful login
      } else {
        setMessage('Invalid credentials');
      }

      console.log('Username:', Username);
      console.log('Password:', Password);

    } 
    catch (error) {
      setMessage('Login failed. Please try again.');
    } 
    finally {
      setLoading(false);  // Stop loading spinner
    }
  };

  return (
    <div className="login-container">
        
      <div className="login-card">
      <div className="back-icon" onClick={() => navigate('/')}>
          <span style={{ color: 'gold' }}>← Back to Login</span>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <h2 className="login-title">Welcome Admin</h2>
          <p className="login-subtitle">Login to access the Admin Panel</p>

          <div className="input-group">
            <label htmlFor="Username">Username</label>
            <input
              id="Username"
              type="text"
              placeholder="Enter Username"
              value={Username}
              onChange={(e) => setDevice(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && <p className="login-message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginAD;
