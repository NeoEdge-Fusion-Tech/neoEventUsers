// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_NEO_URL,   // Should be: http://localhost:8000/api/
  withCredentials: true,                   // CRITICAL for cookies (refresh token)
  timeout: 15000,
});

// Request Interceptor - Attach Access Token
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor - Handle Token Expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loop if refresh token request itself fails with 401
    if (originalRequest.url && originalRequest.url.includes('account/refresh/')) {
      return Promise.reject(error);
    }

    // Only attempt refresh on 401 and if we haven't already tried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use the same API instance for refresh (consistent headers + cookies)
        const { data } = await API.post('account/refresh/');

        // Save new access token
        sessionStorage.setItem('access_token', data.access);

        // Retry original request
        return API(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed");
        sessionStorage.removeItem('access_token');
        
        // Optional: Notify app to logout
        window.dispatchEvent(new Event('forceLogout'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
