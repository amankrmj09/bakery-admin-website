import api from './axiosConfig';

export const engagementsApi = {
  getTestimonials: (params) => api.get('/api/v1/engagement/testimonials', { params }),
  searchTestimonials: (username, params) => api.get('/api/v1/engagement/testimonials/search', { params: { username, ...params } }),
  toggleFeatured: (id, featured) => api.put(`/api/v1/engagement/testimonials/${id}/feature?featured=${featured}`),
  getFeedbacks: (params) => api.get('/api/v1/engagement/feedback', { params }),
  searchFeedbacks: (query, type, params) => api.get('/api/v1/engagement/feedback/search', { params: { query, type, ...params } }),
  getContactDetails: () => api.get('/api/v1/engagement/contact-details'),
  updateContactDetails: (data) => api.put('/api/v1/engagement/contact-details', data),
};
