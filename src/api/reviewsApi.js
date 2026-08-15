import api from './axiosConfig';

export const reviewsApi = {
  getReportedReviews: (params) => api.get('/api/v1/engagement/reviews/reported', { params }),
  getAllReviews: (params) => api.get('/api/v1/engagement/reviews/all', { params }),
  dismissReport: (reviewId) => api.post(`/api/v1/engagement/reviews/${reviewId}/dismiss-report`),
  deleteReportedReview: (reviewId, productId) => api.delete(`/api/v1/engagement/reviews/product/${productId}/${reviewId}`),
  getProductReviews: (productId, params) => api.get(`/api/v1/engagement/reviews/product/${productId}`, { params }),
  deleteReview: (productId, reviewId) => api.delete(`/api/v1/engagement/reviews/product/${productId}/${reviewId}`)
};
