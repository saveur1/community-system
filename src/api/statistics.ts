import { client } from './client';

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

export type OverviewPeriod = {
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
};

export type OverviewBlock = {
  count: number;
  deltaPercent: number;
  previousCount?: number;
  userCount?: number | null;
  userDeltaPercent?: number | null;
};

export type UsersOverview = {
  total: number;
  createdInPeriod: number;
  createdDeltaPercent: number;
  previousCreated?: number;
};

export type SurveysOverview = {
  activeNow: number;
  createdInPeriod: number;
  createdDeltaPercent: number;
  previousCreated?: number;
  respondedByUser: number | null;
  respondedDeltaPercent: number | null;
};

export type StatisticsOverview = {
  feedbacks: OverviewBlock;
  users: UsersOverview;
  surveys: SurveysOverview;
  period: OverviewPeriod;
};

export type SurveysHistoryResult = {
  labels: string[];
  data: number[];
};

export type StatisticsOverviewResponse = ServiceResponse<StatisticsOverview>;
export type SurveysHistoryResponse = ServiceResponse<SurveysHistoryResult>;

export type OverviewParams = {
  startDate?: string;
  endDate?: string;
};

export type SurveysHistoryParams = {
  group?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
  surveyId?: string;
};

/**
 * Statistics API
 */
export const statisticsApi = {
  overview: async (params: OverviewParams = {}): Promise<StatisticsOverviewResponse> => {
    const { data } = await client.get(`/statistics/overview`, { params });
    return data;
  },

  surveysHistory: async (params: SurveysHistoryParams = {}): Promise<SurveysHistoryResponse> => {
    const { data } = await client.get(`/statistics/surveys-history`, { params });
    return data;
  },
};
