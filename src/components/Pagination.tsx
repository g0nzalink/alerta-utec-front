import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary px-4 py-2 min-w-[100px]"
        aria-label="Página anterior"
      >
        Anterior
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`
              inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg px-3 text-sm font-medium transition-all
              ${page === currentPage
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 ring-2 ring-primary-500/50'
                : page === '...'
                ? 'cursor-default text-gray-9000'
                : 'bg-gray-100/80 text-gray-600 border border-gray-300 hover:bg-slate-700 hover:border-slate-600 hover:text-gray-800'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            aria-label={page === '...' ? 'More pages' : `Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary px-4 py-2 min-w-[100px]"
        aria-label="Página siguiente"
      >
        Siguiente
      </button>
    </nav>
  );
};
