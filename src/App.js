import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import InstanceDetail from './pages/InstanceDetail';
import Login from './pages/Login';
import { loadStoredToken, setAuthToken } from './api/client';

export default function App() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if a token is already stored from a previous session
    const stored = loadStoredToken();
    if (stored) setToken(stored);
    setChecking(false);
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('spawnbase_token');
    setToken(null);
  };

  // Don't flash login screen while checking localStorage
  if (checking) return null;

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard onLogout={handleLogout} />}
        />
        <Route
          path="/instances/:id"
          element={<InstanceDetail onLogout={handleLogout} />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}