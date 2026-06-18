import API from './axios';

export const eventService = {
  // Organizer endpoints
  getAllEvents: () => API.get('events/all/'),
  getMyEvents: () => API.get('events/mine/'),
  createEvent: (data) => API.post('events/create/', data),
  generatePresignedUrl: (data) => API.post('events/generate-presigned-url/', data),
  getEventDetail: (slug) => API.get(`events/${slug}/`),
  updateEvent: (id, data) => API.put(`events/${id}/update/`, data),
  deleteEvent: (id) => API.delete(`events/${id}/delete/`),

  // Vendor Management on Event
  getEventVendors: (eventId) => API.get(`events/${eventId}/vendors/`),
  inviteVendor: (eventId, data) => API.post(`events/${eventId}/vendors/invite/`, data),
  removeVendor: (eventId, assignmentId) => API.delete(`events/${eventId}/vendors/${assignmentId}/remove/`),
};
