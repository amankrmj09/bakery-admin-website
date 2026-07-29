import React, { useEffect, useState } from 'react';
import { reviewsApi } from '../api/reviewsApi';
import { toast } from 'sonner';
import { AlertTriangle, Check, Trash2 as Trash, MessageSquare } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import ActionButton from '../components/ui/ActionButton';

export default function Reviews() {
  const isScrolled = useScrollTop();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsApi.getReportedReviews({ page, size: pageSize });
      setReviews(response.data?.content || response.data || []);
      setTotalElements(response.data?.page?.totalElements || response.data?.totalElements || response.data?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch reported reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize]);
  
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const handleDismiss = async (reviewId) => {
    try {
      await reviewsApi.dismissReport(reviewId);
      toast.success('Report dismissed');
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to dismiss report');
    }
  };

  const handleDelete = async (reviewId, productId) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      await reviewsApi.deleteReportedReview(reviewId, productId);
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      <div className={cn(
        "sticky top-0 z-40 flex justify-between items-center flex-wrap gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
            <AlertTriangle className="text-[var(--color-primary)] h-6 w-6" />
            Reported Reviews
          </h1>
          <p className="text-[var(--text-muted)] text-sm">Review and moderate community content</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-500 font-medium">Loading reported reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No reported reviews</h3>
            <p className="text-gray-500">Everything looks good!</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-gray-900">{review.userName}</span>
                    <span className="text-sm text-gray-500">
                      {review.reportedAt ? new Date(review.reportedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-red-600 font-medium mb-1">Reason for report:</p>
                    <p className="text-gray-800 bg-red-50 p-3 rounded-lg text-sm border border-red-100">{review.reportReason}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Review Content:</p>
                    <p className="text-gray-700 italic">"{review.comment}"</p>
                  </div>
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 justify-center md:border-l border-gray-100 md:pl-6">
                  <ActionButton
                    text="Dismiss Report"
                    onClick={() => handleDismiss(review.id)}
                    icon={Check}
                    bgClass="bg-gray-100"
                    textClass="text-gray-700"
                    iconColor="text-gray-700"
                    hoverBgClass="bg-gray-200"
                    className="px-4 h-[42px] w-full"
                  />
                  <ActionButton
                    text="Delete Review"
                    onClick={() => handleDelete(review.id, review.productId)}
                    icon={Trash}
                    bgClass="bg-red-500"
                    hoverBgClass="bg-red-600"
                    className="px-4 h-[42px] w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="mt-auto">
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
      </div>
    </div>
  );
}

