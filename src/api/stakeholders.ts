import { client } from './client';

// Types based on backend controller
export interface StakeholderEntity {
  id: string;
  name: string;
  logo: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  // included relations
  projects?: any[];
}

export interface StakeholderCreateRequest {
  name: string;
  logo?: string | null;
}

export interface StakeholderUpdateRequest extends Partial<StakeholderCreateRequest> {}

export interface StakeholderListParams {
  page?: number;
  limit?: number;
}

// Service response types
export interface ServiceResponse<T> {
  message: string;
  result: T;
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
    [key: string]: any;
  };
}

export interface StakeholderResponse {
  result: StakeholderEntity;
}

export interface StakeholderListResponse {
  result: StakeholderEntity[];
  statusCode: number;
  total: number;
  page: number;
  totalPages: number;
}

export const stakeholdersApi = {
  list: async (params: StakeholderListParams = { page: 1, limit: 10 }): Promise<StakeholderListResponse> => {
    const { data } = await client.get('/stakeholders', { params });
    return data;
  },

  getById: async (stakeholderId: string): Promise<StakeholderResponse> => {
    const { data } = await client.get(`/stakeholders/${stakeholderId}`);
    return data;
  },

  create: async (payload: StakeholderCreateRequest): Promise<StakeholderResponse> => {
    const { data } = await client.post('/stakeholders', payload);
    return data;
  },

  update: async (stakeholderId: string, payload: StakeholderUpdateRequest): Promise<StakeholderResponse> => {
    const { data } = await client.put(`/stakeholders/${stakeholderId}`, payload);
    return data;
  },

  remove: async (stakeholderId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/stakeholders/${stakeholderId}`);
    return data;
  },
}; 