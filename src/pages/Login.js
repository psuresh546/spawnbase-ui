import React, { useState } from 'react';
import { setAuthToken } from '../api/client';

export default function Login({ onLogin }) {
  const [userId, setUserId] = useState('admin-user');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        'http://localhost:8080/api/auth/token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, role }),
        }
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setAuthToken(data.token);
      onLogin(data.token);
    } catch (err) {
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
    }}>
      <div style={{
        background: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        width: '360px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}>
        <h1 style={{ color: '#38bdf8', marginBottom: '0.25rem', fontSize: '1.5rem' }}>
          SpawnBase
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Database Provisioning Platform
        </p>

        <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
          User ID
        </label>
        <input
          value={userId}
          onChange={e => setUserId(e.target.value)}
          style={{
            width: '100%', padding: '0.5rem', marginBottom: '1rem',
            background: '#0f172a', border: '1px solid #334155',
            borderRadius: '6px', color: '#f1f5f9', boxSizing: 'border-box',
            fontSize: '0.875rem',
          }}
        />

        <label style={{ color: '#94a3b8', fontSize: '0.875rem', display: 'block', marginBottom: '0.25rem' }}>
          Role
        </label>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          style={{
            width: '100%', padding: '0.5rem', marginBottom: '1.5rem',
            background: '#0f172a', border: '1px solid #334155',
            borderRadius: '6px', color: '#f1f5f9', boxSizing: 'border-box',
            fontSize: '0.875rem',
          }}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="VIEWER">VIEWER</option>
        </select>

        {error && (
          <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', padding: '0.75rem',
            background: loading ? '#334155' : '#0284c7',
            color: '#fff', border: 'none', borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem', fontWeight: '600',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>
          Development auth only
        </p>
      </div>
    </div>
  );
}