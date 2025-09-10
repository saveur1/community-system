// src/api/projects.ts
import { client } from './client';
import type { DocumentCreateRequest } from './documents';

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

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

// Project entity type (aligns with backend controllers)
export type ProjectEntity = {
  id: string;
  name: string;
  status: ProjectStatus;
  targetGroup: string | null;
  projectDuration: string | null;
  geographicArea: string | null;
  createdAt?: string;
  updatedAt?: string;
  documents?: any[];
  stakeholders?: any[];
  donors?: any[];
};

export type ProjectsListParams = {
  page?: number;
  limit?: number;
};

export type ProjectsListResponse = ServiceResponse<ProjectEntity[]>;
export type ProjectResponse = ServiceResponse<ProjectEntity>;

export type ProjectCreateRequest = {
  name: string;
  status?: ProjectStatus;
  targetGroup?: string | null;
  projectDuration?: string | null;
  geographicArea?: string | null;
  stakeholderIds?: string[];
  donorIds?: string[];
  documents?: Array<Omit<DocumentCreateRequest, 'projectId'>>;
};

export type ProjectUpdateRequest = Partial<ProjectCreateRequest>;

export const projectsApi = {
  list: async (params: ProjectsListParams = { page: 1, limit: 10 }): Promise<ProjectsListResponse> => {
    const { page = 1, limit = 10 } = params;
    const { data } = await client.get(`/projects`, { params: { page, limit } });
    return data;
  },

  getById: async (projectId: string): Promise<ProjectResponse> => {
    const { data } = await client.get(`/projects/${projectId}`);
    return data;
  },

  create: async (payload: ProjectCreateRequest): Promise<ProjectResponse> => {
    const { data } = await client.post(`/projects`, payload);
    return data;
  },

  update: async (projectId: string, payload: ProjectUpdateRequest): Promise<ProjectResponse> => {
    const { data } = await client.put(`/projects/${projectId}`, payload);
    return data;
  },

  remove: async (projectId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/projects/${projectId}`);
    return data;
  },
};
