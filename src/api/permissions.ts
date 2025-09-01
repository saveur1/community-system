import { client } from './client';

// Generic service response used by backend
export type ServiceResponse<T> = {
  message: string;
  result: T;
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
};

export type PermissionEntity = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PermissionsListResponse = ServiceResponse<PermissionEntity[]>;
export type PermissionResponse = ServiceResponse<PermissionEntity>;

export type PermissionCreateRequest = {
  name: string;
  description?: string | null;
};

export type PermissionUpdateRequest = Partial<PermissionCreateRequest>;

export const permissionsApi = {
  list: async (): Promise<PermissionsListResponse> => {
    const { data } = await client.get(`/permissions`);
    return data;
  },

  getById: async (permissionId: string): Promise<PermissionResponse> => {
    const { data } = await client.get(`/permissions/${permissionId}`);
    return data;
  },

  create: async (payload: PermissionCreateRequest): Promise<PermissionResponse> => {
    const { data } = await client.post(`/permissions`, payload);
    return data;
  },

  update: async (permissionId: string, payload: PermissionUpdateRequest): Promise<PermissionResponse> => {
    const { data } = await client.put(`/permissions/${permissionId}`, payload);
    return data;
  },

  remove: async (permissionId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/permissions/${permissionId}`);
    return data;
  },
};
