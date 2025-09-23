import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  communitySessionsApi, 
  type CommunitySessionsListParams, 
  type CommunitySessionCreateRequest, 
  type CommunitySessionUpdateRequest,
  type CommentsListParams,
  type CommentCreateRequest,
  type CommentUpdateRequest,
} from '../api/community-sessions';
import { offlineApi } from '@/services/offline-api';
import { toast } from 'react-toastify';

// Query keys for community sessions
export const communitySessionsKeys = {
  all: ['community-sessions'] as const,
  list: (params?: CommunitySessionsListParams) => [
    ...communitySessionsKeys.all,
    'list',
    params?.page ?? 1,
    params?.limit ?? 10,
    params?.type,
    params?.isActive,
  ] as const,
  detail: (id: string) => [...communitySessionsKeys.all, 'detail', id] as const,
  comments: (sessionId: string, params?: CommentsListParams) => [
    ...communitySessionsKeys.all,
    'comments',
    sessionId,
    params?.page ?? 1,
    params?.limit ?? 50,
  ] as const,
};

// List community sessions
export const useCommunitySessionsList = (params?: CommunitySessionsListParams) => {
  return useQuery({
    queryKey: communitySessionsKeys.list(params),
    queryFn: () => offlineApi.getCommunitySessions(params),
    placeholderData: keepPreviousData,
  });
};

// Get single community session by id
export const useCommunitySession = (id: string) => {
  return useQuery({
    queryKey: communitySessionsKeys.detail(id),
    queryFn: () => offlineApi.getCommunitySession(id),
    enabled: !!id,
  });
};

// Create community session
export const useCreateCommunitySession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CommunitySessionCreateRequest) => communitySessionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.all });
      toast.success('Community session created successfully');
    },
    onError: (error) => {
      console.error('Error creating community session:', error);
      toast.error('Failed to create community session');
    },
  });
};

// Update community session
export const useUpdateCommunitySession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommunitySessionUpdateRequest }) => 
      communitySessionsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.all });
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.detail(id) });
      toast.success('Community session updated successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update community session';
      toast.error(msg);
    },
  });
};

// Update community session status
export const useUpdateCommunitySessionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, isActive }: { sessionId: string; isActive: boolean }) =>
      communitySessionsApi.update(sessionId, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.all });
      toast.success('Community session status updated');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    },
  });
};

// Delete community session
export const useDeleteCommunitySession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => communitySessionsApi.remove(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.all });
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) });
      toast.success('Community session deleted successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete community session';
      toast.error(msg);
    },
  });
};

// Get comments for a community session
export const useCommunitySessionComments = (sessionId: string, params?: CommentsListParams) => {
  return useQuery({
    queryKey: communitySessionsKeys.comments(sessionId, params),
    queryFn: () => offlineApi.getComments(sessionId),
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  });
};

// Add comment to community session
export const useAddComment = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, userId }: { data: CommentCreateRequest; userId: string }) => 
      offlineApi.addComment(sessionId, data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: communitySessionsKeys.comments(sessionId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: communitySessionsKeys.detail(sessionId) 
      });
      toast.success('Comment added successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to add comment';
      toast.error(msg);
    },
  });
};

// Update comment
export function useUpdateComment(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: CommentUpdateRequest }) =>
      communitySessionsApi.updateComment(commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.comments(sessionId) });
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) });
      toast.success('Comment updated successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update comment';
      toast.error(msg);
    },
  });
}

// Delete comment
export function useDeleteComment(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => communitySessionsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.comments(sessionId) });
      queryClient.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) });
      toast.success('Comment deleted successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete comment';
      toast.error(msg);
    },
  });
}
