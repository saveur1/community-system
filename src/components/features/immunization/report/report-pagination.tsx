interface ReportPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const ReportPagination = ({ page, pageSize, total, onPageChange, onPageSizeChange }: ReportPaginationProps) => {
  const totalPages = Math.ceil(total / pageSize);
  const paginatedCount = Math.min(pageSize, Math.max(0, total - (page - 1) * pageSize));

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-600">
        Page {page} of {totalPages} • Showing {paginatedCount} of {total}
      </div>
      <div className="flex items-center gap-2">
        <select
          className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        <button
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Prev
        </button>
        <button
          className="px-3 py-1 rounded-md border border-gray-300 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};
