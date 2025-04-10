import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Settings from './components/AdminPanel';
import Login from './components/Login';
import LocationHistory from './components/LocationHistory';
import HealthMonitor from './components/HealthMonitor';
import AlertHisotry from './components/AlertHistory';
import Stream from './components/Stream';

import LoginAD from './components/LoginAD';

import axios from 'axios';
import AdminPanel from './components/AdminPanel';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);  // Loading state for async check

  useEffect(() => {
    // Check JWT token from localStorage
    const token = window.localStorage.getItem('token');
    
    if (token) {
      // Verify the token with the backend
      axios.post('http://localhost:3001/verify-token', { token })
        .then(response => {
          if (response.data.valid) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem('token');  // Remove invalid token
          }
          setLoading(false);  // Token verification finished
        })
        .catch(() => {
          setIsAuthenticated(false);
          setLoading(false);  // Token verification failed
        });
    } else {
      setIsAuthenticated(false);
      setLoading(false);  // No token found
    }
  }, []);

  // PrivateRoute component to block unauthorized access
  const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
    if (loading) {
      return <div>Loading...</div>;  // Display loading until token check completes
    }
    return isAuthenticated ? element : <Navigate to="/" />;
  };

  // If loading is true, we display a loader or loading screen while the app checks token status
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public route for login */}
        <Route
          path="/"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />

        {/* Protected routes */}
        <Route
          path="/Home"
          element={<PrivateRoute element={<Home />} />}
        />
        <Route
          path="/LocationHistory"
          element={<PrivateRoute element={<LocationHistory />} />}
        />
        <Route
          path="/HealthMonitor"
          element={<PrivateRoute element={<HealthMonitor />} />}
        />
        <Route
          path="/AlertHistory"
          element={<PrivateRoute element={<AlertHisotry />} />}
        />
        <Route
          path="/LoginAD"
          element={<LoginAD setIsAuthenticated={setIsAuthenticated} />}
        />

        <Route
          path="/AdminPanel"
          element={<PrivateRoute element={<AdminPanel />} />}
        />

            <Route
          path="/Stream"
          element={<PrivateRoute element={<Stream />} />}
        />

      </Routes>
    </Router>
  );
}

export default App;
