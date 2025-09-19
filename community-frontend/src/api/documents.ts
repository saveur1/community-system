// src/api/documents.ts
import { client } from './client';

// Mirror backend ServiceResponse shape
export type ServiceResponse<T> = {
  message: string;
  result: T;
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
    [key: string]: any;
  };
};

// Document entity type (aligns with backend models/controllers)
export type DocumentEntity = {
  id: string;
  documentName: string;
  size: number | null;
  type: string | null;
  addedAt: string; // ISO from backend
  documentUrl: string | null;
  projectId: string | null;
  userId: string;
  publicId: string | null;
  deleteToken?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type DocumentsListParams = {
  page?: number;
  limit?: number;
  projectId?: string;
  userId?: string;
};

export type DocumentsListResponse = ServiceResponse<DocumentEntity[]>;
export type DocumentResponse = ServiceResponse<DocumentEntity>;

export type DocumentCreateRequest = {
  projectId?: string;
  documentName: string;
  size?: number | null;
  type?: string | null;
  addedAt?: string | Date;
  documentUrl?: string | null;
  userId: string;
  publicId?: string | null;
  deleteToken?: string | null;
};

export type DocumentUpdateRequest = Partial<DocumentCreateRequest>;

export const documentsApi = {
  list: async (params: DocumentsListParams = {}): Promise<DocumentsListResponse> => {
    const { page = 1, limit = 10, projectId, userId } = params;
    const { data } = await client.get(`/documents`, { params: { page, limit, projectId, userId } });
    return data;
  },

  getById: async (documentId: string): Promise<DocumentResponse> => {
    const { data } = await client.get(`/documents/${documentId}`);
    return data;
  },

  create: async (payload: DocumentCreateRequest): Promise<DocumentResponse> => {
    const { data } = await client.post(`/documents`, payload);
    return data;
  },

  update: async (documentId: string, payload: DocumentUpdateRequest): Promise<DocumentResponse> => {
    const { data } = await client.put(`/documents/${documentId}`, payload);
    return data;
  },

  remove: async (documentId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/documents/${documentId}`);
    return data;
  },
};
