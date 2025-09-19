import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { announcementsApi, type AnnouncementsListParams, type AnnouncementsListResponse, type AnnouncementResponse, type AnnouncementCreateRequest, type AnnouncementUpdateRequest } from '@/api/announcements';
import { toast } from 'react-toastify';

// Query keys
export const announcementsKeys = {
  all: ['announcements'] as const,
  list: (params?: AnnouncementsListParams) => [...announcementsKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...announcementsKeys.all, 'detail', id] as const,
};

// List announcements
export function useAnnouncementsList(params: AnnouncementsListParams = { page: 1, limit: 25 }) {
  return useQuery<AnnouncementsListResponse>({
    queryKey: announcementsKeys.list(params),
    queryFn: () => announcementsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single announcement
export function useAnnouncement(id?: string, enabled = true) {
  return useQuery<AnnouncementResponse>({
    queryKey: announcementsKeys.detail(id ?? ''),
    queryFn: () => announcementsApi.getById(id ?? ''),
    enabled: !!id && enabled,
  });
}

// Create announcement
export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AnnouncementCreateRequest) => announcementsApi.create(payload),
    onSuccess: async () => {
      toast.success('Announcement created');
      await qc.invalidateQueries({ queryKey: announcementsKeys.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to create announcement';
      toast.error(msg);
    },
  });
}

// Update announcement (generic: pass { id, payload })
export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AnnouncementUpdateRequest }) => announcementsApi.update(id, payload),
    onSuccess: async (_res, vars) => {
      toast.success('Announcement updated');
      await Promise.all([
        qc.invalidateQueries({ queryKey: announcementsKeys.list(undefined) }),
        qc.invalidateQueries({ queryKey: announcementsKeys.detail(vars.id) }),
      ]);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update announcement';
      toast.error(msg);
    },
  });
}

// Delete announcement
export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: async () => {
      toast.success('Announcement deleted');
      await qc.invalidateQueries({ queryKey: announcementsKeys.all });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete announcement';
      toast.error(msg);
    },
  });
}
