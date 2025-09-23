import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackApi, type FeedbackListParams, type FeedbackCreateRequest, type FeedbackUpdateRequest, type FeedbackReplyCreateRequest, type FeedbackReplyEntity } from '../api/feedback';
import { offlineApi } from '@/services/offline-api';
import { toast } from 'react-toastify';

const feedbackKeys = {
  all: ['feedback'] as const,
  lists: () => [...feedbackKeys.all, 'list'] as const,
  list: (params: FeedbackListParams) => [...feedbackKeys.lists(), params] as const,
  details: () => [...feedbackKeys.all, 'detail'] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
  stats: () => [...feedbackKeys.all, 'stats'] as const,
  replies: (id: string) => [...feedbackKeys.detail(id), 'replies'] as const,
};

export const useGetFeedback = (params: FeedbackListParams) => {
  return useQuery({
    queryKey: [...feedbackKeys.lists(), params],
    queryFn: () => offlineApi.getFeedback(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
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

export const useGetFeedbackReplies = (feedbackId: string) => {
  return useQuery<FeedbackReplyEntity[]>({
    queryKey: feedbackKeys.replies(feedbackId),
    queryFn: () => feedbackApi.getReplies(feedbackId),
    enabled: !!feedbackId,
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
    mutationFn: (data: FeedbackCreateRequest) => offlineApi.createFeedback(data),
    onSuccess: async (data) => {
      // Show success message
      if (data.message.includes('offline')) {
        toast.info('Feedback saved offline and will be synced when online');
      } else {
        toast.success('Feedback submitted successfully');
      }
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to submit feedback';
      toast.error(msg);
    },
  });
};

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackUpdateRequest }) => feedbackApi.update(id, data),
    onSuccess: async (_, { id }) => {
      // toast.success(`Feedback ${data?.result?.status}`)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.stats() }),
      ]);
    },
  });
};

export const useAddFeedbackReply = (feedbackId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FeedbackReplyCreateRequest) => feedbackApi.addReply(feedbackId, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: feedbackKeys.replies(feedbackId) }),
        queryClient.invalidateQueries({ queryKey: feedbackKeys.detail(feedbackId) }),
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
