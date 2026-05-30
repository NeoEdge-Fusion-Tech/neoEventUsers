import API from './axios';

export const vendorService = {
  getVendorTypes: () => API.get('events/vendors/types/'),
  getCategories: () => API.get('vendors/categories/'),
  createCategory: (data, config = {}) => API.post('vendors/categories/', data, config),
  updateCategory: (id, data, config = {}) => API.patch(`vendors/categories/${id}/`, data, config),
  deleteCategory: (id) => API.delete(`vendors/categories/${id}/`),
  
  getEvents: () => API.get('vendors/events/'),
  createEvent: (data) => API.post('vendors/events/', data),
  deleteEvent: (id) => API.delete(`vendors/events/${id}/`),
  
  getGallery: () => API.get('vendors/gallery/'),
  deleteGalleryMedia: (id) => API.delete(`vendors/gallery/${id}/`),
  uploadMedia: (data) => API.post('vendors/gallery/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getPublicProfile: (id) => API.get(`vendors/profile/${id}/`),
  
  getAllSystemEvents: () => API.get('events/all/'), 

  getMyAssignments: () => API.get('events/vendors/my-assignments/'),
  respondToInvite: (code, accept) => API.post(`events/invitations/${code}/respond/`, { accept }),
  uploadInvitedEventMedia: (assignmentId, formData) => API.post(`events/vendors/assignments/${assignmentId}/media/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getInvitedEventMedia: (assignmentId) => API.get(`events/vendors/assignments/${assignmentId}/media/`),
  getBusinessProfile: () => API.get('vendors/business/'),
  updateBusinessProfile: (data) => API.patch('vendors/business/', data),
};
