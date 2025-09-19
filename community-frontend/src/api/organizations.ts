import type { User } from './auth';
import { client } from './client';
import type { ProjectEntity } from './projects';

// Service response shape
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

// Organization types (replaces Stakeholder types)
export interface OrganizationEntity {
  id: string;
  name: string;
  description?: string | null;
  logo?: string | null;
  type?: 'stakeholder' | 'system_owner';
  ownerId?: string | null;
  status?: 'active' | 'suspended' | 'deleted';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // relations
  owner?: User;
  projects?: ProjectEntity[];
  users?: User[];
}

export interface OrganizationCreateRequest {
  name: string;
  description?: string | null;
  logo?: string | null;
  type?: 'stakeholder' | 'system_owner';
  ownerId?: string | null;
  permissionIds?: string[];
}

export interface OrganizationUpdateRequest extends Partial<OrganizationCreateRequest> {
  status?: 'active' | 'suspended' | 'deleted';
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  type?: 'stakeholder' | 'system_owner';
  status?: 'active' | 'suspended' | 'deleted';
}

// Response types
export type OrganizationResponse = ServiceResponse<OrganizationEntity>;
export type OrganizationListResponse = ServiceResponse<OrganizationEntity[]>;

// Organizations API (was stakeholdersApi)
export const organizationsApi = {
  list: async (params: OrganizationListParams = { page: 1, limit: 10 }): Promise<OrganizationListResponse> => {
    const { page = 1, limit = 10, type, status } = params;
    const { data } = await client.get(`/organizations`, { params: { page, limit, type, status } });
    return data;
  },

  getById: async (organizationId: string): Promise<OrganizationResponse> => {
    const { data } = await client.get(`/organizations/${organizationId}`);
    return data;
  },

  create: async (payload: OrganizationCreateRequest): Promise<OrganizationResponse> => {
    const { data } = await client.post(`/organizations`, payload);
    return data;
  },

  update: async (organizationId: string, payload: OrganizationUpdateRequest): Promise<OrganizationResponse> => {
    const { data } = await client.put(`/organizations/${organizationId}`, payload);
    return data;
  },

  remove: async (organizationId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/organizations/${organizationId}`);
    return data;
  },
};