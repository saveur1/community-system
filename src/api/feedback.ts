import { client } from './client';

// Types based on backend controller

export interface DocumentInput {
  documentName: string;
  documentUrl: string;
  type: string;
  size?: number | null;
  publicId?: string | null;
  deleteToken?: string | null;
}

export interface FeedbackEntity {
  id: string;
  mainMessage: string | null;
  feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  suggestions: string | null;
  followUpNeeded: boolean;
  status: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
  projectId: string | null;
  responderName?: string;
  userId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  documents?: DocumentInput[];
  user?: {
    id: string,
    name: string,
    email: string,
    roles: [
      {
        id: string,
        name: string,
        UserRole: {
          id: number,
          userId: string,
          roleId: string,
          createdAt: Date,
          updatedAt: Date
        }
      }
    ]
  },
  project?: {
    id: string,
    name: string,
    status: string
  }
}

export interface FeedbackCreateRequest {
  projectId?: string | null;
  mainMessage?: string | null;
  feedbackType?: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  suggestions?: string | null;
  responderName?: string | null;
  followUpNeeded?: boolean;
  documents?: DocumentInput[];
  otherFeedbackOn?: string;
}

export interface FeedbackUpdateRequest extends Partial<FeedbackCreateRequest> {
  status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
}

export interface FeedbackListParams {
  page?: number;
  limit?: number;
  status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
  feedbackType?: 'positive' | 'negative' | 'suggestion' | 'concern';
  owner?: 'me' | 'other';
  projectId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Replace 'any' with more specific types if you have them
export interface FeedbackResponse {
  result: FeedbackEntity;
}

export interface FeedbackListResponse<T> {
  result: T;
  statusCode: number;
  total: number;
  page: number;
  totalPages: number;
}

export interface FeedbackStatsResponse {
  data: any;
}

export const feedbackApi = {
  list: async (params: FeedbackListParams = { page: 1, limit: 10 }): Promise<FeedbackListResponse<FeedbackEntity[]>> => {
    const { data } = await client.get('/feedback', { params });
    return data;
  },

  getUserFeedback: async (params: FeedbackListParams = { page: 1, limit: 10 }): Promise<FeedbackListResponse<FeedbackEntity[]>> => {
    const { data } = await client.get('/feedback/user', { params });
    return data;
  },

  getById: async (feedbackId: string): Promise<FeedbackResponse> => {
    const { data } = await client.get(`/feedback/${feedbackId}`);
    return data;
  },

  create: async (payload: FeedbackCreateRequest): Promise<FeedbackResponse> => {
    const { data } = await client.post('/feedback', payload);
    return data;
  },

  update: async (feedbackId: string, payload: FeedbackUpdateRequest): Promise<FeedbackResponse> => {
    const { data } = await client.put(`/feedback/${feedbackId}`, payload);
    return data;
  },

  delete: async (feedbackId: string): Promise<void> => {
    await client.delete(`/feedback/${feedbackId}`);
  },

  getStats: async (): Promise<FeedbackStatsResponse> => {
    const { data } = await client.get('/feedback/stats/summary');
    return data;
  },
};
