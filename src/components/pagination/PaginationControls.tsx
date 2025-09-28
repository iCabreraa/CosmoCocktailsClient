"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  visiblePages: number[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  className?: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  visiblePages,
  hasNextPage,
  hasPrevPage,
  isFirstPage,
  isLastPage,
  onPageChange,
  onNext,
  onPrev,
  onFirst,
  onLast,
  className = "",
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Primera página */}
      <button
        onClick={onFirst}
        disabled={isFirstPage}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            isFirstPage
              ? "text-cosmic-silver/50 cursor-not-allowed"
              : "text-cosmic-gold hover:bg-cosmic-gold/10 hover:scale-105"
          }
        `}
        aria-label="Primera página"
      >
        <ChevronDoubleLeftIcon className="w-5 h-5" />
      </button>

      {/* Página anterior */}
      <button
        onClick={onPrev}
        disabled={!hasPrevPage}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            !hasPrevPage
              ? "text-cosmic-silver/50 cursor-not-allowed"
              : "text-cosmic-gold hover:bg-cosmic-gold/10 hover:scale-105"
          }
        `}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>

      {/* Páginas visibles */}
      <div className="flex items-center space-x-1">
        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              px-3 py-2 rounded-lg font-medium transition-all duration-200 min-w-[40px]
              ${
                page === currentPage
                  ? "bg-cosmic-gold text-cosmic-bg shadow-lg transform scale-105"
                  : "text-cosmic-gold hover:bg-cosmic-gold/10 hover:scale-105"
              }
            `}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Página siguiente */}
      <button
        onClick={onNext}
        disabled={!hasNextPage}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            !hasNextPage
              ? "text-cosmic-silver/50 cursor-not-allowed"
              : "text-cosmic-gold hover:bg-cosmic-gold/10 hover:scale-105"
          }
        `}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>

      {/* Última página */}
      <button
        onClick={onLast}
        disabled={isLastPage}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            isLastPage
              ? "text-cosmic-silver/50 cursor-not-allowed"
              : "text-cosmic-gold hover:bg-cosmic-gold/10 hover:scale-105"
          }
        `}
        aria-label="Última página"
      >
        <ChevronDoubleRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
