// src/api/auth.js 
import API from './axios';

export const authService = {
  // Login handled directly in Context, but can be moved here for consistency
  login: (credentials) => API.post('login/', credentials),

  // Registration for different roles
  registerVendor: (data) => API.post('vendor/register/', data),
  registerOwner: (data) => API.post('owner/register/', data),
  registerAttendee: (data) => API.post('attendee/register/', data),

  // Token & Session
  refresh: () => API.post('refresh/'),
  logout: () => API.post('logout/'),

  // Profile management (Me-style endpoints)
  getOwnerProfile: () => API.get('owner/profile/'),
  getVendorProfile: () => API.get('vendor/profile/'),
  updateOwnerProfile: (data) => API.patch('owner/profile/', data),
  updateVendorProfile: (data) => API.patch('vendor/profile/', data),
};

// import api from "./index";

// export const login = async (username, password) => {
//   const response = await api.post("/accounts/login/", {
//     username,
//     password,
//   });

//   return response.data;
// };


// export const refreshAccessToken = async () => {
//   const response = await api.post("/accounts/refresh/");

//   return response.data.access;
// };


// export const logout = async () => {
//   await api.post("/accounts/logout/");
// };


// export const registerVendor = async (userData) => {
//   const response = await api.post(
//     "/accounts/register/vendor/",
//     userData
//   );

//   return response.data;
// };


// export const registerOwner = async (userData) => {
//   const response = await api.post(
//     "/accounts/register/owner/",
//     userData
//   );

//   return response.data;
// };

