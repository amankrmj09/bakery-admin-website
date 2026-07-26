import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  className
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safeCurrentPage = Math.max(0, Math.min(currentPage, safeTotalPages - 1));

  const handlePrevious = () => {
    if (safeCurrentPage > 0 && !loading) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < safeTotalPages - 1 && !loading) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    let pages = [];
    if (safeTotalPages <= 5) {
      pages = Array.from({ length: safeTotalPages }, (_, i) => i);
    } else {
      if (safeCurrentPage <= 2) {
        pages = [0, 1, 2, 3, safeTotalPages - 1];
      } else if (safeCurrentPage >= safeTotalPages - 3) {
        pages = [0, safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1];
      } else {
        pages = [0, safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, safeTotalPages - 1];
      }
    }

    return pages.map((pageIdx, idx) => {
      if (idx > 0 && pageIdx - pages[idx - 1] > 1) {
        return (
          <React.Fragment key={`ellipsis-${pageIdx}`}>
            <span className="px-1 text-xs text-[var(--text-muted)]">...</span>
            <button
              onClick={() => !loading && onPageChange(pageIdx)}
              disabled={loading}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors",
                safeCurrentPage === pageIdx
                  ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/20"
                  : "border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-panel-hover)] text-[var(--text-main)]"
              )}
            >
              {pageIdx + 1}
            </button>
          </React.Fragment>
        );
      }
      return (
        <button
          key={pageIdx}
          onClick={() => !loading && onPageChange(pageIdx)}
          disabled={loading}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors",
            safeCurrentPage === pageIdx
              ? "bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/20"
              : "border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-panel-hover)] text-[var(--text-main)]"
          )}
        >
          {pageIdx + 1}
        </button>
      );
    });
  };

  if (!totalElements && totalElements !== 0) return null; // Don't render if undefined

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-[var(--border-color)]/50 bg-[var(--bg-panel-hover)]/30", className)}>
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <span>Page <strong className="font-medium text-[var(--text-main)]">{safeCurrentPage + 1}</strong> of <strong className="font-medium text-[var(--text-main)]">{safeTotalPages}</strong></span>
        <span>({totalElements} total items)</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[var(--border-color)]">
          <label htmlFor="pageSizeTop" className="text-xs font-semibold text-[var(--text-muted)]">Show:</label>
          <select
            id="pageSizeTop"
            value={pageSize}
            onChange={(e) => {
              if (!loading && onPageSizeChange) {
                onPageSizeChange(Number(e.target.value));
              }
            }}
            disabled={loading}
            className="bg-transparent border border-[var(--border-color)] rounded-lg px-2 py-1 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--color-primary)]"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={safeCurrentPage === 0 || loading}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-panel-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--text-main)]"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {renderPageNumbers()}

          <button
            onClick={handleNext}
            disabled={safeCurrentPage >= safeTotalPages - 1 || loading}
            className="p-1.5 rounded-lg border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-panel-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[var(--text-main)]"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
