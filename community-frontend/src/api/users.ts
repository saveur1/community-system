// src/api/users.ts
import { client } from './client';
import type { User } from './auth';

// Generic service response used by backend
export type ServiceResponse<T> = {
  message: string;
  result: T;
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
};

export type UsersListParams = {
  page?: number;
  limit?: number;
  search?: string
};

export type UsersListResponse = ServiceResponse<User[]>;
export type UserResponse = ServiceResponse<User>;

// Payloads — align with backend IUserCreateRequest / IUserUpdateRequest
export type UserCreateRequest = {
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  verified?: boolean;
  roleIds?: string[]; // optional: if backend supports setting roles
  stakeholderId?: string; // Optional: associate user with a stakeholder on creation
};

export type UserUpdateRequest = Partial<Omit<UserCreateRequest, 'password'>> & {
  password?: string; // optional update
  verified?: boolean;
};

export type UpdateUserRolesRequest = {
  roleIds: string[];
};

export const usersApi = {
  list: async (params: UsersListParams = {}): Promise<UsersListResponse> => {
    const { page = 1, limit = 10, search } = params;
    const { data } = await client.get(`/users`, { params: { page, limit, search } });
    return data;
  },

  getById: async (userId: string): Promise<UserResponse> => {
    const { data } = await client.get(`/users/${userId}`);
    return data;
  },

  create: async (payload: UserCreateRequest): Promise<UserResponse> => {
    const { data } = await client.post(`/users`, payload);
    return data;
  },

  update: async (userId: string, payload: UserUpdateRequest): Promise<UserResponse> => {
    const { data } = await client.put(`/users/${userId}`, payload);
    return data;
  },

  updateRoles: async (userId: string, payload: UpdateUserRolesRequest): Promise<UserResponse> => {
    const { data } = await client.put(`/users/${userId}/roles`, payload);
    return data;
  },

  remove: async (userId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/users/${userId}`);
    return data;
  },
};
