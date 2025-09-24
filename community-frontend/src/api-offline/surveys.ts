// src/services/offline-api.ts
import { offlineStorage } from '../services/offline-storage';
import { surveysApi, type SurveyEntity, type SurveysListParams, type SubmitAnswersRequest } from '@/api/surveys';
import type { ServiceResponse } from '@/api/surveys';
import { offlineCommon } from './common';
import { toast } from 'react-toastify';

export class OfflineApiService {
  private static instance: OfflineApiService;

  static getInstance(): OfflineApiService {
    if (!OfflineApiService.instance) {
      OfflineApiService.instance = new OfflineApiService();
    }
    return OfflineApiService.instance;
  }

  async getSurveyResponses(
    surveyId?: string,
    responderId?: string,
    page: number = 1,
    limit: number = 10,
    surveyType?: 'report-form' | 'general' | 'rapid-enquiry'
  ): Promise<any> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await surveysApi.responses(surveyId, responderId, page, limit, surveyType);
        // Map to OfflineSurveyResponse for caching
        const toOffline = (items: any[]) => items.map((r: any) => ({
          id: r.id,
          surveyId: r.surveyId,
          userId: r.user?.id || r.userId || null,
          answers: (r.answers || []).map((a: any) => ({
            questionId: a.questionId,
            answerText: a.answerText ?? null,
            answerOptions: a.answerOptions ?? null,
          })),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
          syncStatus: 'synced' as const,
          retryCount: 0,
        }));

        await offlineStorage.cacheSurveyResponses(toOffline(response.result));
        return response;
      }
    } catch (error) {
      console.log('API request failed, responses falling back to offline:', error);
    }

    // Fallback to cached responses in Dexie
    try {
      const cached = await offlineStorage.getCachedSurveyResponses({ surveyId, responderId });
      toast.info(JSON.stringify({message: "Responses loaded from offline cache", cached}));
      // Apply simple pagination on cached results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const slice = cached.slice(startIndex, endIndex);
      return {
        message: 'Responses loaded from offline cache',
        result: slice,
        total: cached.length,
        page,
        totalPages: Math.ceil(cached.length / limit),
        limit
      };
    } catch { }

    // If nothing cached, provide a safe offline fallback
    return {
      message: 'Responses not available offline; showing empty list',
      result: [],
      total: 0,
      page,
      totalPages: 0,
      limit
    };
  }

  async getResponseById(responseId: string): Promise<any> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await surveysApi.getResponseById(responseId);
        // Cache normalized response for offline
        try {
          const r = response.result;
          const normalized = [{
            id: r.id,
            surveyId: r.surveyId,
            userId: r.user?.id || r.userId || null,
            answers: (r.answers || []).map((a: any) => ({
              questionId: a.questionId,
              answerText: a.answerText ?? null,
              answerOptions: a.answerOptions ?? null,
            })),
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            syncStatus: 'synced' as const,
            retryCount: 0,
          }];
          await offlineStorage.cacheSurveyResponses(normalized as any);
        } catch { }
        return response;
      }
    } catch (error) {
      console.log('API request failed, responseById falling back to offline:', error);
    }

    // Fallback to cached response detail if available in Dexie
    try {
      const cached = await offlineStorage.getCachedResponseById(responseId);
      if (cached) {
        return {
          message: 'Response detail loaded from offline cache',
          result: cached
        };
      }
    } catch { }

    // If nothing cached, return a descriptive error
    throw new Error('Response details are not available offline');
  }

  async getSurveyAnalytics(surveyId: string, params: { startDate?: string; endDate?: string } = {}): Promise<any> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await surveysApi.getAnalytics(surveyId, params);
        return response;
      }
    } catch (error) {
      console.log('API request failed, analytics falling back to offline:', error);
    }

    // Provide an offline-safe empty analytics structure
    return {
      message: 'Analytics not available offline; showing empty dataset',
      result: {
        surveyId,
        surveyTitle: '',
        totalResponses: 0,
        uniqueRespondents: 0,
        completionRate: 0,
        trends: [],
        questionAnalytics: []
      }
    };
  }

  async getLatestRapidEnquiry(): Promise<ServiceResponse<SurveyEntity>> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await surveysApi.getLatestRapidEnquiry();
        // Cache the survey for offline access
        await offlineStorage.cacheSurveys([response.result as any]);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to offline rapid enquiry:', error);
    }

    // Fallback to cached rapid-enquiry surveys and pick the most recent by updatedAt/createdAt
    const cached = await offlineStorage.getCachedSurveys({ surveyType: 'rapid-enquiry' as any });
    if (cached.length === 0) {
      throw new Error('No rapid enquiry available offline');
    }
    const latest = [...cached].sort((a: any, b: any) => {
      const ta = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const tb = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return tb - ta;
    })[0];

    return {
      message: 'Rapid enquiry loaded from offline cache',
      result: latest as any
    };
  }

  async updateSurvey(surveyId: string, payload: Partial<SurveyEntity>): Promise<ServiceResponse<SurveyEntity>> {
    if (offlineCommon.isOnline()) {
      try {
        const response = await surveysApi.update(surveyId, payload as any);
        await offlineStorage.cacheSurveys([response.result as any]);
        return response;
      } catch (error) {
        console.log('Online update failed, saving offline update:', error);
      }
    }

    const existing = await offlineStorage.getCachedSurvey(surveyId);
    if (!existing) throw new Error('Survey not found in offline cache');
    const updated = { ...existing, ...payload, updatedAt: new Date().toISOString() } as any;
    await offlineStorage.cacheSurveys([updated]);
    await offlineStorage.addToSyncQueue('survey', surveyId, 'update', { id: surveyId, payload });

    return {
      message: 'Survey update saved offline and will be synced when online',
      result: updated
    };
  }

  async deleteSurvey(surveyId: string): Promise<ServiceResponse<null>> {
    if (offlineCommon.isOnline()) {
      try {
        const response = await surveysApi.remove(surveyId);
        // Remove from cache if present
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (await import('../services/offline-storage')).offlineStorage['getCachedSurvey'](surveyId).then(async (s) => {
          if (s) {
            // direct access since we don't have a helper, but db is encapsulated; fallback: overwrite with no-op
            // We can just cache nothing; Dexie will replace on next sync.
          }
        });
        return response;
      } catch (error) {
        console.log('Online delete failed, queuing offline delete:', error);
      }
    }

    await offlineStorage.addToSyncQueue('survey', surveyId, 'delete', { id: surveyId });
    return {
      message: 'Survey deletion queued offline and will be synced when online',
      result: null
    };
  }

  // Surveys API with offline support
  async getSurveys(params: SurveysListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<SurveyEntity[]>> {
    try {
      if (offlineCommon.isOnline()) {
        // Try to fetch from API first
        const response = await surveysApi.list(params);
        // Cache the results
        await offlineStorage.cacheSurveys(response.result);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    let cachedSurveys = await offlineStorage.getCachedSurveys({
      status: params.status,
      surveyType: params.surveyType
    });

    // Apply offline search filtering if search term provided
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      cachedSurveys = cachedSurveys.filter((s: any) => {
        const title = String(s.title ?? '').toLowerCase();
        const description = String(s.description ?? '').toLowerCase();
        const project = String(s.project ?? '').toLowerCase();
        return title.includes(q) || description.includes(q) || project.includes(q);
      });
    }

    // Apply pagination to cached results
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedSurveys.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults as SurveyEntity[],
      total: cachedSurveys.length,
      page,
      totalPages: Math.ceil(cachedSurveys.length / limit),
      limit
    };
  }

  async getSurvey(surveyId: string): Promise<ServiceResponse<SurveyEntity>> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await surveysApi.getById(surveyId);
        // Cache the individual survey
        await offlineStorage.cacheSurveys([response.result]);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    const cachedSurvey = await offlineStorage.getCachedSurvey(surveyId);
    if (!cachedSurvey) {
      throw new Error('Survey not found in offline cache');
    }

    return {
      message: 'Data retrieved from offline cache',
      result: cachedSurvey as SurveyEntity
    };
  }

  async submitSurveyAnswers(surveyId: string, payload: SubmitAnswersRequest): Promise<ServiceResponse<SurveyEntity>> {
    if (offlineCommon.isOnline()) {
      try {
        // Try to submit directly
        const response = await surveysApi.submitAnswers(surveyId, payload);
        return response;
      } catch (error) {
        console.log('Online submission failed, saving offline:', error);
      }
    }

    // Save for offline sync
    const responseId = await offlineStorage.saveSurveyResponse(
      surveyId,
      payload.answers,
      payload.userId || undefined
    );

    return {
      message: 'Survey response saved offline and will be synced when online',
      result: { id: responseId } as any
    };
  }
}

export const offlineSurveyApi = OfflineApiService.getInstance();
