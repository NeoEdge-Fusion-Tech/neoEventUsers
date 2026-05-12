import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
  withCredentials: true, // CRITICAL: Sends HttpOnly cookies (refresh token)
});

// Request Interceptor: Attach Access Token to every request
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle Token Expiration
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Hit your RefreshTokenView
        const { data } = await axios.post(
          `${API.defaults.baseURL}refresh/`,
          {},
          { withCredentials: true }
        );
        
        sessionStorage.setItem('access_token', data.access);
        return API(originalRequest); // Retry the original failed request
      } catch (refreshError) {
        // If refresh fails, user must log in again
        window.dispatchEvent(new Event('logout'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default API;

