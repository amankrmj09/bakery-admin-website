import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsApi } from '../api/reviewsApi';
import { toast } from 'sonner';
import { Check, Trash2 as Trash, MessageSquare, ExternalLink } from 'lucide-react';
import Pagination from '../components/shared/Pagination';
import { useScrollTop } from '../hooks/useScrollTop';
import { cn } from '../lib/utils';
import { Card, CardContent } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import ActionIconButton from '../components/ui/ActionIconButton';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

export default function Reviews() {
  const navigate = useNavigate();
  const isScrolled = useScrollTop();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let response;
      if (tab === 'all') {
        response = await reviewsApi.getAllReviews({ page, size: pageSize });
      } else {
        response = await reviewsApi.getReportedReviews({ page, size: pageSize });
      }
      setReviews(response.data?.content || response.data || []);
      setTotalElements(response.data?.page?.totalElements || response.data?.totalElements || response.data?.length || 0);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, pageSize, tab]);
  
  const totalPages = Math.ceil(totalElements / pageSize) || 1;

  const handleDismiss = (reviewId) => {
    setConfirmDialog({
      title: 'Dismiss Report',
      message: 'Are you sure you want to dismiss this report? The review will remain visible.',
      confirmLabel: 'Dismiss',
      confirmClass: 'bg-gray-800 hover:bg-gray-900',
      icon: Check,
      onConfirm: async () => {
        try {
          await reviewsApi.dismissReport(reviewId);
          toast.success('Report dismissed');
          setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (error) {
          toast.error('Failed to dismiss report');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  const handleDelete = (reviewId, productId) => {
    setConfirmDialog({
      title: 'Delete Review',
      message: 'Are you sure you want to permanently delete this review? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      icon: Trash,
      onConfirm: async () => {
        try {
          await reviewsApi.deleteReportedReview(reviewId, productId);
          toast.success('Review deleted');
          setReviews(reviews.filter(r => r.id !== reviewId));
        } catch (error) {
          toast.error('Failed to delete review');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  return (
    <div className="flex flex-col min-h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full pb-8">
      <div className={cn(
        "sticky top-0 z-40 flex flex-col gap-4 transition-all duration-300",
        isScrolled 
          ? "bg-[var(--bg-panel)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-md rounded-2xl px-6 py-4 mt-2" 
          : "bg-transparent border-transparent py-2"
      )}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
              <MessageSquare className="text-[var(--color-primary)] h-6 w-6" />
              Customer Reviews
            </h1>
            <p className="text-[var(--text-muted)] text-sm">Review and moderate community content</p>
          </div>
          <div className="inline-flex bg-[var(--bg-panel)] p-1 rounded-xl shadow-sm border border-[var(--border-color)]">
            <button
              onClick={() => { setTab('all'); setPage(0); }}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                tab === 'all' 
                  ? "bg-blue-50 text-[var(--color-primary)] shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50"
              )}
            >
              All Reviews
            </button>
            <button
              onClick={() => { setTab('reported'); setPage(0); }}
              className={cn(
                "px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                tab === 'reported' 
                  ? "bg-red-50 text-red-600 shadow-sm" 
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50"
              )}
            >
              Reported Reviews
            </button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && reviews.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading reviews...</TableCell></TableRow>
              ) : reviews.length > 0 ? (
                reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {r.reportedAt || r.createdAt
                        ? new Date(r.reportedAt || r.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">{r.userName}</TableCell>
                    <TableCell className="max-w-[400px]">
                      <p className="text-sm text-gray-700 truncate" title={r.comment}>"{r.comment}"</p>
                      {r.isReported && r.reportReason && (
                        <p className="text-xs text-red-600 mt-1 truncate" title={r.reportReason}>Reported: {r.reportReason}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.isReported ? (
                        <Badge variant="destructive">Reported</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <ActionIconButton 
                        icon={ExternalLink} 
                        onClick={() => navigate(`/products?openProductId=${r.productId}`)} 
                        title="View Product" 
                        colorClass="text-blue-600 bg-blue-50 hover:bg-blue-100" 
                      />
                      {r.isReported && (
                        <ActionIconButton 
                          icon={Check} 
                          onClick={() => handleDismiss(r.id)} 
                          title="Dismiss Report" 
                          colorClass="text-emerald-600 bg-emerald-50 hover:bg-emerald-100" 
                        />
                      )}
                      <ActionIconButton 
                        icon={Trash} 
                        onClick={() => handleDelete(r.id, r.productId)} 
                        title="Delete Review" 
                        colorClass="text-red-600 bg-red-50 hover:bg-red-100" 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No {tab === 'reported' ? 'reported ' : ''}reviews found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          loading={loading}
        />
      </Card>

      <ConfirmDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={() => confirmDialog?.onConfirm()}
        title={confirmDialog?.title || 'Confirm'}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel || 'Confirm'}
        variant={confirmDialog?.variant || 'danger'}
        icon={confirmDialog?.icon}
      />
    </div>
  );
}


