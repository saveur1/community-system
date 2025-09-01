import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi, FeedbackListParams, FeedbackCreateRequest, FeedbackUpdateRequest } from '../api/feedback';
// import { toast } from 'react-toastify';
import { checkPermissions } from '@/utility/logicFunctions';
import useAuth from './useAuth';

const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (params: FeedbackListParams) => [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
  stats: () => [...feedbackKeys.all, 'stats'] as const,
};

// Unified hook: chooses scope based on permissions
// If user has 'feedback:all:read' -> fetch all
// else if user has 'feedback:personal:read' -> fetch personal
// else -> disabled query
export const useGetFeedback = (params: FeedbackListParams) => {
  const { user, isUserLoading } = useAuth();
  const canReadAll = checkPermissions(user, 'feedback:all:read');
  const canReadPersonal = checkPermissions(user, 'feedback:personal:read');
  const scope = canReadAll ? 'all' : canReadPersonal ? 'personal' : 'none';

  return useQuery({
    queryKey: [...feedbackKeys.lists(), scope, params],
    enabled: !isUserLoading && scope !== 'none',
    queryFn: () => (canReadAll ? feedbackApi.list(params) : feedbackApi.getUserFeedback(params)),
  });
};

export const useGetUserFeedback = (params: FeedbackListParams) => {
  return useQuery({
    queryKey: ['userFeedback', params],
    queryFn: () => feedbackApi.getUserFeedback(params),
  });
};

export const useGetFeedbackById = (id: string) => {
  return useQuery({
    queryKey: feedbackKeys.detail(id),
    queryFn: () => feedbackApi.getById(id),
    enabled: !!id,
  });
};

export const useGetFeedbackStats = () => {
  return useQuery({
    queryKey: feedbackKeys.stats(),
    queryFn: () => feedbackApi.getStats(),
  });
};

export const useCreateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeedbackCreateRequest) => feedbackApi.create(data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() }),
      ]);
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackUpdateRequest }) => feedbackApi.update(id, data),
    onSuccess: async (data, { id }) => {
      // toast.success(`Feedback ${data?.result?.status}`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() }),
      ]);
    },
  });
};

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feedbackApi.delete(id),
    onSuccess: async () => {
      // toast.success('Feedback deleted successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() }),
      ]);
    },
  });
};
