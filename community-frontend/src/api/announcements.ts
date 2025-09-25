import { client } from './client';

// Mirror backend ServiceResponse shape
export type ServiceResponse<T> = {
  message: string;
  result: T;
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
};

export type AnnouncementAudience = 'all' | 'stakeholders' | 'community' | 'rich_members' | 'providers';
export type AnnouncementStatus = 'draft' | 'scheduled' | 'sent' | 'stopped';

export type AnnouncementEntity = {
  id: string;
  title: string;
  message: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  scheduledAt?: string | null;
  viewDetailsLink?: string | null;
  allowedRoles?: Array<{ id: string; name: string }>;
  createdBy?: string | null;
  creator?: { id: string; name?: string; email?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AnnouncementsListParams = {
  page?: number;
  limit?: number;
  status?: AnnouncementStatus;
  q?: string;
  startDate?: string;
  endDate?: string;
  allowed?: boolean;
};

export type AnnouncementsListResponse = ServiceResponse<AnnouncementEntity[]>;
export type AnnouncementResponse = ServiceResponse<AnnouncementEntity>;

export type AnnouncementCreateRequest = {
  title: string;
  message: string;
  status?: AnnouncementStatus;
  scheduledAt?: string | null;
  viewDetailsLink?: string | null;
  allowedRoles?: string[] | null;
};

export type AnnouncementUpdateRequest = Partial<AnnouncementCreateRequest>;

export const announcementsApi = {
  list: async (params: AnnouncementsListParams = { page: 1, limit: 25 }): Promise<AnnouncementsListResponse> => {
    const { data } = await client.get(`/announcements`, { params });
    return data;
  },

  getById: async (id: string): Promise<AnnouncementResponse> => {
    const { data } = await client.get(`/announcements/${id}`);
    return data;
  },

  create: async (payload: AnnouncementCreateRequest): Promise<AnnouncementResponse> => {
    const { data } = await client.post(`/announcements`, payload);
    return data;
  },

  update: async (id: string, payload: AnnouncementUpdateRequest): Promise<AnnouncementResponse> => {
    const { data } = await client.put(`/announcements/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/announcements/${id}`);
    return data;
  },
};
