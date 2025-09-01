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
};

export type RoleEntity = {
  id: string;
  name: string;
  description: string | null;
  category?: string | null;
  createdAt: string;
  updatedAt: string;
  permissions?: PermissionEntity[];
};

export type RolesListParams = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
};

export type RolesListResponse = ServiceResponse<RoleEntity[]>;
export type RoleResponse = ServiceResponse<RoleEntity>;

export type RoleCreateRequest = {
  name: string;
  description?: string | null;
  category: string | null;
  permissionIds?: string[];
};

export type RoleUpdateRequest = Partial<RoleCreateRequest>;

export const rolesApi = {
  list: async (params: RolesListParams = {}): Promise<RolesListResponse> => {
    const { data } = await client.get(`/roles`, { params });
    return data;
  },

  getById: async (roleId: string): Promise<RoleResponse> => {
    const { data } = await client.get(`/roles/${roleId}`);
    return data;
  },

  create: async (payload: RoleCreateRequest): Promise<RoleResponse> => {
    const { data } = await client.post(`/roles`, payload);
    return data;
  },

  update: async (roleId: string, payload: RoleUpdateRequest): Promise<RoleResponse> => {
    const { data } = await client.put(`/roles/${roleId}`, payload);
    return data;
  },

  remove: async (roleId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/roles/${roleId}`);
    return data;
  },

  addPermission: async (
    roleId: string,
    permissionId: string
  ): Promise<RoleResponse> => {
    const { data } = await client.post(`/roles/${roleId}/permissions`, { permissionId });
    return data;
  },

  removePermission: async (
    roleId: string,
    permissionId: string
  ): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/roles/${roleId}/permissions/${permissionId}`);
    return data;
  },
};
