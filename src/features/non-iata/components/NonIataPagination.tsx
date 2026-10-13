import React from 'react';
import { IChevronLeft, IChevronRight } from '@/components/ui/Icons';

export interface NonIataPaginationProps {
  pageNumber: number; // 0-indexed from Spring Boot
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  onPageChange: (newPage: number) => void;
}

export const NonIataPagination: React.FC<NonIataPaginationProps> = ({
  pageNumber,
  pageSize,
  totalElements,
  totalPages,
  isFirst,
  isLast,
  onPageChange,
}) => {
  if (totalElements === 0) return null;

  const start = pageNumber * pageSize + 1;
  const end = Math.min((pageNumber + 1) * pageSize, totalElements);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      const left = Math.max(1, pageNumber - 1);
      const right = Math.min(totalPages - 2, pageNumber + 1);

      if (left > 1) {
        pages.push('...');
      }

      for (let i = left; i <= right; i++) {
        pages.push(i);
      }

      if (right < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-xs">
      <div className="text-slate-500">
        Showing <span className="font-semibold text-slate-700">{start}</span> to{' '}
        <span className="font-semibold text-slate-700">{end}</span> of{' '}
        <span className="font-semibold text-slate-700">{totalElements}</span> accounts
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={isFirst}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <IChevronLeft size={14} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-slate-400">
                  ...
                </span>
              );
            }

            const isCurrent = page === pageNumber;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[#0F2E22] text-white'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {page + 1}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={isLast}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <IChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
