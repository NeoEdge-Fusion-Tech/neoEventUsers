import API from './axios';

export const ticketService = {
  // Event registration / tickets
  getEventTicketTypes: (eventId) => API.get(`event/${eventId}/tickets/`),
  registerEvent: (data) => API.post('register/', data),
  getRegistrationDetail: (code) => API.get(`registrations/${code}/`),
  checkInEvent: (code) => API.post(`check-in/${code}/`),

  // Attendee endpoints
  getUpcomingEvents: () => API.get('attendee/events/upcoming/'),
  getPastEvents: () => API.get('attendee/events/history/'),
  getMyRegistrationDetail: (code) => API.get(`attendee/registrations/${code}/`),
  cancelRegistration: (id) => API.delete(`attendee/registrations/${id}/cancel/`),
  getActiveTickets: () => API.get('attendee/tickets/active/'),
  getAttendeeProfile: () => API.get('me/attendee-profile/'),
};
