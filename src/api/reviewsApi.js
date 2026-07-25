import api from './axiosConfig';

export const reviewsApi = {
  getReportedReviews: (params) => {
    let url = '/api/admin/reviews/reported';
    return api.get(url, { params });
  },
  dismissReport: (reviewId) => api.post(`/api/admin/reviews/${reviewId}/dismiss`),
  deleteReportedReview: (reviewId, productId) => api.delete(`/api/admin/reviews/${reviewId}/product/${productId}`),
};
