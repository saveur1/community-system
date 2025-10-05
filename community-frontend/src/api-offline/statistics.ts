import { offlineStorage } from '../services/offline-storage';
import { statisticsApi, type OverviewParams, type SurveysHistoryParams, type StatisticsOverviewResponse, type SurveysHistoryResponse, type StatisticsOverview, type SurveysHistoryResult } from '@/api/statistics';
import { offlineCommon } from './common';
import type { OfflineStatisticsOverview, OfflineSurveysHistory } from '@/db/schema';

// Make this available globally for debugging
declare global {
  interface Window {
    debugStatistics: typeof offlineStatisticsApi;
  }
}

export const offlineStatisticsApi = {
  overview: async (params: OverviewParams = {}): Promise<StatisticsOverviewResponse> => {
    
    // Try online first
    if (offlineCommon.isOnline()) {
      try {
        const response = await statisticsApi.overview(params);
        // Clear existing statistics before caching new user-specific data
        await offlineStorage.clearTableData('statisticsOverview');
        // Cache result using the same pattern as feedback
        try {
          const cacheData: OfflineStatisticsOverview = {
            id: 'current_overview', // Use simple static key like feedback does
            ...response.result,
            lastSynced: Date.now()
          };
          await offlineStorage.cacheStatisticsOverview(cacheData);
        } catch (cacheError) {
          console.warn('Failed to cache statistics overview:', cacheError);
        }
        return response;
      } catch (err) {
        console.warn('statistics.overview online call failed, falling back to cache', err);
      }
    }

    // Offline / fallback: attempt to read cached overview
    const cached = await offlineStorage.getCachedStatisticsOverview('current_overview');
    if (cached) {
      return {
        message: 'Overview loaded from offline cache',
        result: {
          feedbacks: cached.feedbacks,
          users: cached.users,
          surveys: cached.surveys,
          period: cached.period
        }
      };
    }

    // Safe empty fallback matching StatisticsOverview shape
    const empty: StatisticsOverview = {
      feedbacks: { count: 0, deltaPercent: 0 },
      users: { total: 0, createdInPeriod: 0, createdDeltaPercent: 0 },
      surveys: {
        activeNow: 0,
        createdInPeriod: 0,
        createdDeltaPercent: 0,
        respondedByUser: 0,
        respondedDeltaPercent: 0
      },
      period: {
        start: params.startDate ?? '',
        end: params.endDate ?? '',
        previousStart: '',
        previousEnd: ''
      }
    };

    return {
      message: 'Analytics not available offline; showing empty dataset',
      result: empty
    };
  },

  surveysHistory: async (params: SurveysHistoryParams = { group: 'monthly' }): Promise<SurveysHistoryResponse> => {
    
    if (offlineCommon.isOnline()) {
      try {
        const response = await statisticsApi.surveysHistory(params);
        // Clear existing surveys history before caching new user-specific data
        await offlineStorage.clearTableData('surveysHistory');
        // Cache the result using simple static key
        try {
          const cacheData: OfflineSurveysHistory = {
            id: 'current_surveys_history', // Use simple static key
            ...response.result,
            lastSynced: Date.now()
          };

          await offlineStorage.cacheSurveysHistory(cacheData);
        } catch (cacheError) {
          console.warn('Failed to cache surveys history:', cacheError);
        }
        return response;
      } catch (err) {
        console.warn('statistics.surveysHistory online call failed, falling back to cache', err);
      }
    }

    const cached = await offlineStorage.getCachedSurveysHistory('current_surveys_history');
    
    if (cached) {
      return {
        message: 'Surveys history loaded from offline cache',
        result: {
          labels: cached.labels,
          data: cached.data
        }
      };
    }

    // Safe empty fallback for charts
    const empty: SurveysHistoryResult = {
      labels: [],
      data: []
    };

    return {
      message: 'Surveys history not available offline; returning empty dataset',
      result: empty
    };
  }
};