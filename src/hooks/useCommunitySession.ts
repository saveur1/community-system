import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  communitySessionsApi, 
  type CommunitySessionsListParams, 
  type CommunitySessionsListResponse, 
  type CommunitySessionResponse, 
  type CommunitySessionCreateRequest, 
  type CommunitySessionUpdateRequest,
  type CommentsListParams,
  type CommentsListResponse,
  type CommentCreateRequest,
  type CommentUpdateRequest,
  type CommentResponse
} from '../api/community-sessions';
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
export function useCommunitySessionsList(params: CommunitySessionsListParams = { page: 1, limit: 10 }) {
  return useQuery<CommunitySessionsListResponse>({
    queryKey: communitySessionsKeys.list(params),
    queryFn: () => communitySessionsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single community session by id
export function useCommunitySession(sessionId: string, enabled: boolean = true) {
  return useQuery<CommunitySessionResponse>({
    queryKey: communitySessionsKeys.detail(sessionId),
    queryFn: () => communitySessionsApi.getById(sessionId),
    enabled: !!sessionId && enabled,
  });
}

// Create community session
export function useCreateCommunitySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunitySessionCreateRequest) => communitySessionsApi.create(payload),
    onSuccess: async () => {
      toast.success('Community session created successfully');
      await qc.invalidateQueries({ queryKey: communitySessionsKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create community session';
      toast.error(msg);
    },
  });
}

// Update community session
export function useUpdateCommunitySession(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommunitySessionUpdateRequest) => communitySessionsApi.update(sessionId, payload),
    onSuccess: async () => {
      toast.success('Community session updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) }),
        qc.invalidateQueries({ queryKey: communitySessionsKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update community session';
      toast.error(msg);
    },
  });
}

// Update community session status
export function useUpdateCommunitySessionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, isActive }: { sessionId: string; isActive: boolean }) =>
      communitySessionsApi.update(sessionId, { isActive }),
    onSuccess: async () => {
      toast.success('Community session status updated');
      await qc.invalidateQueries({ queryKey: communitySessionsKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    },
  });
}

// Delete community session
export function useDeleteCommunitySession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => communitySessionsApi.remove(sessionId),
    onSuccess: async (_data, sessionId) => {
      toast.success('Community session deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: communitySessionsKeys.all }),
        qc.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete community session';
      toast.error(msg);
    },
  });
}

// Get comments for a community session
export function useCommunitySessionComments(sessionId: string, params: CommentsListParams = { page: 1, limit: 50 }) {
  return useQuery<CommentsListResponse>({
    queryKey: communitySessionsKeys.comments(sessionId, params),
    queryFn: () => communitySessionsApi.getComments(sessionId, params),
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  });
}

// Add comment to community session
export function useAddComment(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CommentCreateRequest) => communitySessionsApi.addComment(sessionId, payload),
    onSuccess: async () => {
      toast.success('Comment added successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: communitySessionsKeys.comments(sessionId) }),
        qc.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to add comment';
      toast.error(msg);
    },
  });
}

// Update comment
export function useUpdateComment(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: CommentUpdateRequest }) =>
      communitySessionsApi.updateComment(commentId, payload),
    onSuccess: async () => {
      toast.success('Comment updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: communitySessionsKeys.comments(sessionId) }),
        qc.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update comment';
      toast.error(msg);
    },
  });
}

// Delete comment
export function useDeleteComment(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => communitySessionsApi.deleteComment(commentId),
    onSuccess: async () => {
      toast.success('Comment deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: communitySessionsKeys.comments(sessionId) }),
        qc.invalidateQueries({ queryKey: communitySessionsKeys.detail(sessionId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete comment';
      toast.error(msg);
    },
  });
}
