// src/api/auth.js 
import API from './axios';

export const authService = {
  // Login handled directly in Context, but can be moved here for consistency
  login: (credentials) => API.post('account/login/', credentials),

  // Registration for different roles
  registerVendor: (data) => API.post('account/vendor/register/', data),
  registerOwner: (data) => API.post('account/owner/register/', data),
  registerAttendee: (data) => API.post('account/attendee/register/', data),

  // Token & Session
  refresh: () => API.post('account/refresh/'),
  logout: () => API.post('account/logout/'),

  // Profile management (Me-style endpoints)
  getOwnerProfile: () => API.get('owner/profile/'),
  getVendorProfile: () => API.get('vendor/profile/'),
  updateOwnerProfile: (data) => API.patch('owner/profile/', data),
  updateVendorProfile: (data) => API.patch('vendor/profile/', data),
};

