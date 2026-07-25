import api from './axiosConfig';

export const engagementsApi = {
  getTestimonials: () => api.get('/api/v1/engagement/testimonials'),
  searchTestimonials: (username) => api.get('/api/v1/engagement/testimonials/search', { params: { username } }),
  toggleFeatured: (id, featured) => api.put(`/api/v1/engagement/testimonials/${id}/feature?featured=${featured}`),
  getFeedbacks: () => api.get('/api/v1/engagement/feedback'),
  searchFeedbacks: (query) => api.get('/api/v1/engagement/feedback/search', { params: { query } }),
};
