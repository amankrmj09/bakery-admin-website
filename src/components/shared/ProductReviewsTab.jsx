import React, { useEffect, useState } from 'react';
import { reviewsApi } from '../../api/reviewsApi';
import { toast } from 'sonner';
import { Trash2 as Trash, Star, MessageSquare, Loader2 } from 'lucide-react';
import Pagination from './Pagination';

export default function ProductReviewsTab({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsApi.getProductReviews(productId, { page, size: pageSize });
      setReviews(response.data?.content || response.data || []);
      setTotalElements(response.data?.page?.totalElements || response.data?.totalElements || response.data?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch product reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, page, pageSize]);

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await reviewsApi.deleteReview(productId, reviewId);
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  if (loading && reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900">No reviews yet</h3>
          <p className="text-gray-500 text-sm">Customers haven't reviewed this product.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-sm">{review.userName || 'Anonymous User'}</span>
                      {review.isReported && (
                        <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Reported</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Review"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                {review.isReported && review.reportReason && (
                  <div className="mt-2 bg-red-50 p-2 rounded text-xs border border-red-100">
                    <strong className="text-red-700">Report Reason:</strong> <span className="text-red-600">{review.reportReason}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
              loading={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}
