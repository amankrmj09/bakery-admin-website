import api from './axiosConfig';

export const engagementsApi = {
  getTestimonials: (params) => api.get('/api/v1/engagement/testimonials', { params }),
  searchTestimonials: (username, params) => api.get('/api/v1/engagement/testimonials/search', { params: { username, ...params } }),
  toggleFeatured: (id, featured) => api.put(`/api/v1/engagement/testimonials/${id}/feature?featured=${featured}`),
  deleteTestimonial: (id) => api.delete(`/api/v1/engagement/testimonials/${id}`),
  getFeedbacks: (params) => api.get('/api/v1/engagement/feedback', { params }),
  searchFeedbacks: (query, type, params) => api.get('/api/v1/engagement/feedback/search', { params: { query, type, ...params } }),
  deleteFeedback: (id) => api.delete(`/api/v1/engagement/feedback/${id}`),
  updateFeedbackStatus: (id, status) => api.put(`/api/v1/engagement/feedback/${id}/status`, null, { params: { status } }),
  getContactDetails: () => api.get('/api/v1/engagement/contact-details'),
  updateContactDetails: (data) => api.put('/api/v1/engagement/contact-details', data),
};
