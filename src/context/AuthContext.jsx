// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import API from '../api/axios';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await API.post('account/refresh/');
        setUser(data.user);
        // Optionally store access token
        if (data.access) {
          sessionStorage.setItem('access_token', data.access);
        }
      } catch (err) {
        // Expected behavior on first visit or when token expired
        console.log("No active session");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await API.post('account/login/', credentials);
      setUser(data.user);
      if (data.access) {
        sessionStorage.setItem('access_token', data.access);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await API.post('account/logout/');
    } catch (err) {
      console.log("Logout error", err);
    } finally {
      setUser(null);
      sessionStorage.removeItem('access_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
