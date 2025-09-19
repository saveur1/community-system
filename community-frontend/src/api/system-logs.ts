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

// System log entity returned by backend
export type SystemLogEntity = {
  id: string;
  userId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  meta?: any | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// List params and responses
export type SystemLogsListParams = {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
};

export type SystemLogsListResponse = ServiceResponse<SystemLogEntity[]>;
export type SystemLogResponse = ServiceResponse<SystemLogEntity>;

export const systemLogsApi = {
  list: async (params: SystemLogsListParams = { page: 1, limit: 25 }): Promise<SystemLogsListResponse> => {
    const { page = 1, limit = 25, userId, action, resourceType, startDate, endDate } = params;
    const { data } = await client.get(`/system-logs`, { params: { page, limit, userId, action, resourceType, startDate, endDate } });
    return data;
  },

  getById: async (id: string): Promise<SystemLogResponse> => {
    const { data } = await client.get(`/system-logs/${id}`);
    return data;
  },

  create: async (payload: { action: string; resourceType?: string | null; resourceId?: string | null; meta?: any | null }): Promise<SystemLogResponse> => {
    const { data } = await client.post(`/system-logs`, payload);
    return data;
  },

  remove: async (id: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/system-logs/${id}`);
    return data;
  },
};
