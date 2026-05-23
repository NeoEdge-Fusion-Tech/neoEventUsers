import API from './axios';

export const vendorService = {
  getCategories: () => API.get('vendors/categories/'),
  createCategory: (data) => API.post('vendors/categories/', data),
  
  getEvents: () => API.get('vendors/events/'),
  createEvent: (data) => API.post('vendors/events/', data),
  
  getGallery: () => API.get('vendors/gallery/'),
  uploadMedia: (data) => API.post('vendors/gallery/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  getPublicProfile: (id) => API.get(`vendors/profile/${id}/`),
  
  getAllSystemEvents: () => API.get('events/all/'), 

  getMyAssignments: () => API.get('events/vendors/my-assignments/'),
  respondToInvite: (code, accept) => API.post(`events/invitations/${code}/respond/`, { accept })
};
