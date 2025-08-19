import { Dispatch, SetStateAction } from "react";

interface SurveyPaginationProps {
    currentPage: number;
    totalPages: number;
    paginatedCount: number;
    filteredCount: number;
    pageSize: number;
    setPage: Dispatch<SetStateAction<number>>
    setPageSize: Dispatch<SetStateAction<number>>;
  }
  
  export const SurveyPagination = ({
    currentPage,
    totalPages,
    paginatedCount,
    filteredCount,
    pageSize,
    setPage,
    setPageSize,
  }: SurveyPaginationProps) => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} • Showing {paginatedCount} of {filteredCount}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            disabled={currentPage <= 1}
            onClick={() => setPage((p: number) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    );
  };
