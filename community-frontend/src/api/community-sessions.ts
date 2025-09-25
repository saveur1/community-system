// src/api/community-sessions.ts
import { client } from './client';
import type { RoleEntity } from './roles';

export const communitySessionsApi = {
  list: async (params: CommunitySessionsListParams = { page: 1, limit: 10 }): Promise<CommunitySessionsListResponse> => {
    const { page = 1, limit = 10, type, isActive, allowed, search } = params;
    const { data } = await client.get(`/community-sessions`, { params: { page, limit, type, isActive, allowed, search } });
    return data;
  },

  getById: async (sessionId: string): Promise<CommunitySessionResponse> => {
    const { data } = await client.get(`/community-sessions/${sessionId}`);
    return data;
  },

  create: async (payload: CommunitySessionCreateRequest): Promise<CommunitySessionResponse> => {
    const { data } = await client.post(`/community-sessions`, payload);
    return data;
  },

  update: async (sessionId: string, payload: CommunitySessionUpdateRequest): Promise<CommunitySessionResponse> => {
    const { data } = await client.put(`/community-sessions/${sessionId}`, payload);
    return data;
  },

  remove: async (sessionId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/community-sessions/${sessionId}`);
    return data;
  },

  // Comments endpoints
  getComments: async (sessionId: string, params: CommentsListParams = { page: 1, limit: 50 }): Promise<CommentsListResponse> => {
    const { page = 1, limit = 50 } = params;
    const { data } = await client.get(`/community-sessions/${sessionId}/comments`, { params: { page, limit } });
    return data;
  },

  addComment: async (sessionId: string, payload: CommentCreateRequest): Promise<CommentResponse> => {
    const { data } = await client.post(`/community-sessions/${sessionId}/comments`, payload);
    return data;
  },

  updateComment: async (commentId: string, payload: CommentUpdateRequest): Promise<CommentResponse> => {
    const { data } = await client.put(`/community-sessions/comments/${commentId}`, payload);
    return data;
  },

  deleteComment: async (commentId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/community-sessions/comments/${commentId}`);
    return data;
  },
};

// TYPES
// Mirror backend ServiceResponse shape
export type ServiceResponse<T> = {
  message: string;
  result: T;
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
};

// Types aligned with backend controllers/models
export type CommunitySessionType = 'video' | 'image' | 'document' | 'audio';

export type DocumentEntity = {
  id: string;
  documentName: string;
  size: number | null;
  type: string | null;
  addedAt: string; // ISO string from backend
  documentUrl: string | null;
  projectId?: string | null;
  userId: string;
  publicId?: string | null;
  deleteToken?: string | null;
};

export type UserEntity = {
  id: string;
  name: string;
  email?: string;
  profile?: string | null;
};

export type CommentEntity = {
  id: string;
  content: string;
  communitySessionId: string;
  userId: string;
  timestamp?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: UserEntity;
};

export type CommunitySessionEntity = {
  id: string;
  title: string;
  shortDescription: string;
  documentId: string | null;
  type: CommunitySessionType;
  allowedRoles: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // included relations
  document?: DocumentEntity;
  creator?: UserEntity;
  comments?: CommentEntity[];
  roles?: RoleEntity[];
};

// List params and responses
export type CommunitySessionsListParams = {
  page?: number;
  limit?: number;
  type?: CommunitySessionType;
  isActive?: boolean;
  allowed?: boolean;
  search?: string;
};

export type CommentsListParams = {
  page?: number;
  limit?: number;
};

export type CommunitySessionsListResponse = ServiceResponse<CommunitySessionEntity[]>;
export type CommunitySessionResponse = ServiceResponse<CommunitySessionEntity>;
export type CommentsListResponse = ServiceResponse<CommentEntity[]>;
export type CommentResponse = ServiceResponse<CommentEntity>;

// Request types
export type CommunitySessionCreateRequest = {
  title: string;
  shortDescription: string;
  type: CommunitySessionType;
  allowedRoles: string[];
  roles?: RoleEntity[];
  document: {
    documentName: string;
    size?: number | null;
    type?: string | null;
    addedAt?: string; // ISO string; backend will default if not provided
    documentUrl?: string | null;
    userId: string;
    publicId?: string | null;
    deleteToken?: string | null;
  };
};

export type CommunitySessionUpdateRequest = Partial<CommunitySessionCreateRequest> & {
  isActive?: boolean;
};

export type CommentCreateRequest = {
  content: string;
  timestamp?: number;
};

export type CommentUpdateRequest = {
  content: string;
};
