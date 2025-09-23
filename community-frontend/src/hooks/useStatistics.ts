import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type OverviewParams, type SurveysHistoryParams, type StatisticsOverviewResponse, type SurveysHistoryResponse } from '@/api/statistics';
import { offlineStatisticsApi } from '@/api-offline/statistics';

// query keys
export const statisticsKeys = {
  all: ['statistics'] as const,
  overview: (params?: OverviewParams) => [...statisticsKeys.all, 'overview', params ?? {}] as const,
  surveysHistory: (params?: SurveysHistoryParams) => [...statisticsKeys.all, 'surveys-history', params ?? {}] as const,
};

/**
 * Fetch dashboard overview statistics (feedbacks, users, surveys)
 * params: { startDate?, endDate? } - optional date range
 */
export function useStatisticsOverview(params: OverviewParams = {}) {
  const queryResult = useQuery<StatisticsOverviewResponse>({
    queryKey: statisticsKeys.overview(params),
    queryFn: () => offlineStatisticsApi.overview(params),
    placeholderData: keepPreviousData,
  });

  return queryResult;
}

/**
 * Fetch surveys responses history for charting
 * params: { group?, startDate?, endDate?, surveyId? }
 */
export function useSurveysHistory(params: SurveysHistoryParams = { group: 'monthly' }) {
  const queryResult = useQuery<SurveysHistoryResponse>({
    queryKey: statisticsKeys.surveysHistory(params),
    queryFn: () => offlineStatisticsApi.surveysHistory(params),
    placeholderData: keepPreviousData,
  });

  return queryResult;
}