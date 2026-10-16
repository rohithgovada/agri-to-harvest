import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('ath_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            localStorage.removeItem('ath_token');
          }
        } catch (e) {
          localStorage.removeItem('ath_token');
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('ath_token', res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.register(userData);
      if (res.success && res.token) {
        localStorage.setItem('ath_token', res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const demoLogin = async (role) => {
    setError(null);
    try {
      const res = await api.demoLogin(role);
      if (res.success && res.token) {
        localStorage.setItem('ath_token', res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('ath_token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await api.updateProfile(data);
    if (res.success) {
      setUser(res.user);
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, demoLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
