// components/settings/SystemLogsTab.tsx
import React, { useState } from 'react';
import { spacer } from '@/utility/logicFunctions';
import { useSystemLogsList, useDeleteSystemLog } from '@/hooks/useSystemLogs';

interface SystemLogsTabProps {}

export const SystemLogsTab: React.FC<SystemLogsTabProps> = () => {
  const [logsSearch, setLogsSearch] = useState('');
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize] = useState(10);

  const { data: logsResponse, isLoading: logsLoading } = useSystemLogsList({
    page: logsPage,
    limit: logsPageSize,
    action: logsSearch || undefined,
  });

  const deleteLog = useDeleteSystemLog();

  const logs = logsResponse?.result ?? [];
  const totalLogs = logsResponse?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil((logsResponse?.meta?.total ?? 0) / logsPageSize));

  const handleLogsSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogsSearch(e.target.value);
    setLogsPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">System Logs</h3>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <input
              value={logsSearch}
              onChange={handleLogsSearchChange}
              placeholder="Search action (e.g. created user)..."
              className="w-full pl-4 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300">Action</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300 hidden md:table-cell">Resource</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300 hidden md:table-cell">User</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300">Created</th>
              <th className="text-right py-3 px-6 text-sm font-medium text-gray-500 dark:text-gray-300">Actions</th>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">Loading logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">No logs found</td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-200 capitalize">{spacer(log.action)}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-200 hidden md:table-cell">
                      <div className="capitalize">{log.resourceType || '-'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.resourceId ?? ''}</div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-200 hidden md:table-cell">{log.userId ?? '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-200">{new Date(log.createdAt || '').toLocaleString()}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500 dark:text-red-400"
                          title="Delete log"
                          onClick={async () => {
                            if (!confirm('Delete this system log?')) return;
                            await deleteLog.mutateAsync(log.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-sm">
            <div className="text-gray-600 dark:text-gray-400">Showing {logs.length} of {totalLogs}</div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                disabled={logsPage <= 1}
                onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Prev
              </button>
              <span className="px-2 text-gray-700 dark:text-gray-200">{logsPage} / {totalPages}</span>
              <button
                disabled={logsPage >= totalPages}
                onClick={() => setLogsPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50"
              >
                Next
              </button>
              <select
                value={logsPageSize}
                onChange={(_) => { /* page size fixed for simplicity */ }}
                className="ml-2 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                disabled
              >
                <option value={10}>10</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};