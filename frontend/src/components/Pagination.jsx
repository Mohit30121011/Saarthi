import React from 'react'

/**
 * Reusable Tiranga Civic Modern theme-matched Pagination component
 * Conforms to Saarthi design system tokens:
 * - Chakra Blue (#0D2240) for active highlights & primary contrast
 * - Kesari Saffron (#E65100) for accents and badge highlights
 * - Clean slate surfaces (#F8FAFC, #FFFFFF) with subtle borders
 * 
 * Props:
 * @param {number} currentPage - 1-indexed active page
 * @param {number} totalPages - Total calculated pages
 * @param {number} totalItems - Total count of items in the dataset
 * @param {number} itemsPerPage - Items displayed per page (default 9 = 3 rows x 3 cards)
 * @param {function} onPageChange - Callback when a page is selected (pageNumber: number) => void
 * @param {string} itemLabel - Label for items (e.g. "schemes", "eligible schemes", "saved schemes")
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 9,
  onPageChange,
  itemLabel = 'schemes',
}) {
  if (totalItems === 0) return null

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers with smart ellipsis windowing
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []
    // Always include page 1
    pages.push(1)

    if (currentPage > 3) {
      pages.push('dots-left')
    }

    // Window around current page
    const windowStart = Math.max(2, currentPage - 1)
    const windowEnd = Math.min(totalPages - 1, currentPage + 1)

    for (let p = windowStart; p <= windowEnd; p++) {
      pages.push(p)
    }

    if (currentPage < totalPages - 2) {
      pages.push('dots-right')
    }

    // Always include last page
    pages.push(totalPages)

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      aria-label="Scheme catalog pagination"
      className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-border shadow-xs"
    >
      {/* Items Range Summary */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-chakra-blue-light text-chakra-blue font-bold text-[10px]">
          <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
        </span>
        <span>
          Showing <strong className="font-bold text-chakra-blue">{startItem}</strong>–
          <strong className="font-bold text-chakra-blue">{endItem}</strong> of{' '}
          <strong className="font-bold text-chakra-blue">{totalItems}</strong> {itemLabel}
        </span>
        {totalPages > 1 && (
          <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-[#44474E] border border-slate-200">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* First Page Button (Desktop) */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-border text-on-surface hover:bg-slate-50 hover:text-chakra-blue hover:border-chakra-blue/30 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-border transition-all cursor-pointer shadow-2xs"
            title="First Page"
          >
            <span className="material-symbols-outlined text-[18px]">first_page</span>
          </button>

          {/* Previous Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-border text-xs font-semibold text-on-surface hover:bg-slate-50 hover:text-chakra-blue hover:border-chakra-blue/30 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-border transition-all cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page Number Pills */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, idx) => {
              if (page === 'dots-left' || page === 'dots-right') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 text-center text-xs text-on-surface-variant font-bold select-none"
                  >
                    …
                  </span>
                )
              }

              const isCurrent = page === currentPage

              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  onClick={() => onPageChange(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                  className={`min-w-8 h-8 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-chakra-blue text-white shadow-xs ring-2 ring-chakra-blue/20 ring-offset-1'
                      : 'bg-white text-on-surface border border-slate-border hover:bg-slate-50 hover:border-chakra-blue/40 hover:text-chakra-blue'
                  }`}
                >
                  {page}
                </button>
              )
            })}
          </div>

          {/* Next Page Button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-border text-xs font-semibold text-on-surface hover:bg-slate-50 hover:text-chakra-blue hover:border-chakra-blue/30 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-border transition-all cursor-pointer shadow-2xs"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>

          {/* Last Page Button (Desktop) */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            className="hidden lg:inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-slate-border text-on-surface hover:bg-slate-50 hover:text-chakra-blue hover:border-chakra-blue/30 disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-slate-border transition-all cursor-pointer shadow-2xs"
            title="Last Page"
          >
            <span className="material-symbols-outlined text-[18px]">last_page</span>
          </button>
        </div>
      )}
    </nav>
  )
}
