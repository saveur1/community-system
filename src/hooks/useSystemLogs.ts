import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemLogsApi, type SystemLogsListParams, type SystemLogsListResponse, type SystemLogResponse } from '../api/system-logs';
import { toast } from 'react-toastify';

// Query keys
export const systemLogsKeys = {
  all: ['systemLogs'] as const,
  list: (params?: SystemLogsListParams) => [...systemLogsKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...systemLogsKeys.all, 'detail', id] as const,
};

// List system logs
export function useSystemLogsList(params: SystemLogsListParams = { page: 1, limit: 25 }) {
  return useQuery<SystemLogsListResponse>({
    queryKey: systemLogsKeys.list(params),
    queryFn: () => systemLogsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single system log by id
export function useSystemLog(id?: string, enabled = true) {
  return useQuery<SystemLogResponse>({
    queryKey: systemLogsKeys.detail(id ?? ''),
    queryFn: () => systemLogsApi.getById(id ?? ''),
    enabled: !!id && enabled,
  });
}

// Delete a system log
export function useDeleteSystemLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => systemLogsApi.remove(id),
    onSuccess: async (_res, id) => {
      toast.success('System log deleted');
      await Promise.all([
        qc.invalidateQueries({ queryKey: systemLogsKeys.all }),
        qc.invalidateQueries({ queryKey: systemLogsKeys.detail(id) }),
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete system log';
      toast.error(msg);
    },
  });
}
