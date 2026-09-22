import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('pulselife_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        logout();
      }
    } catch (err) {
      console.error(err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('pulselife_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('pulselife_token');
  };

  // Preset Role Switcher for Super Admin testing
  const demoLogin = async (role) => {
    const demoAccounts = {
      Admin: { email: 'admin@pulselife.com', password: 'admin123' },
      'Blood Bank': { email: 'cbc@pulselife.com', password: 'password123' },
      Hospital: { email: 'rghospital@pulselife.com', password: 'password123' },
      Donor: { email: 'sarah.smith@gmail.com', password: 'password123' }
    };

    const credentials = demoAccounts[role];
    if (!credentials) return;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.user, data.token);
      }
    } catch (err) {
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, demoLogin, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
