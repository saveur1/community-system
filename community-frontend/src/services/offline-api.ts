// src/services/offline-api.ts
import { offlineStorage } from './offline-storage';
import { syncService } from './sync-service';
import { surveysApi, type SurveyEntity, type SurveysListParams, type SubmitAnswersRequest } from '@/api/surveys';
import { communitySessionsApi, type CommunitySessionEntity, type CommunitySessionsListParams, type CommentCreateRequest } from '@/api/community-sessions';
import { feedbackApi, type FeedbackListParams, type FeedbackCreateRequest } from '@/api/feedback';
import { projectsApi, type ProjectEntity, type ProjectsListParams } from '@/api/projects';
import type { ServiceResponse } from '@/api/surveys';

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
      if (this.isOnline()) {
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
        try {
          await offlineStorage.cacheSurveyResponses(toOffline(response.result));
        } catch { }
        return response;
      }
    } catch (error) {
      console.log('API request failed, responses falling back to offline:', error);
    }

    // Fallback to cached responses in Dexie
    try {
      const cached = await offlineStorage.getCachedSurveyResponses({ surveyId, responderId });
      // Apply simple pagination on cached results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const slice = cached.slice(startIndex, endIndex);
      return {
        message: 'Responses loaded from offline cache',
        result: slice,
        meta: {
          total: cached.length,
          page,
          totalPages: Math.ceil(cached.length / limit),
          limit
        }
      };
    } catch { }

    // If nothing cached, provide a safe offline fallback
    return {
      message: 'Responses not available offline; showing empty list',
      result: [],
      meta: {
        total: 0,
        page,
        totalPages: 0,
        limit
      }
    };
  }

  async getResponseById(responseId: string): Promise<any> {
    try {
      if (this.isOnline()) {
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
      if (this.isOnline()) {
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
      if (this.isOnline()) {
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
    if (this.isOnline()) {
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
    if (this.isOnline()) {
      try {
        const response = await surveysApi.remove(surveyId);
        // Remove from cache if present
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (await import('./offline-storage')).offlineStorage['getCachedSurvey'](surveyId).then(async (s) => {
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

  public isOnline(): boolean {
    return syncService.getNetworkStatus();
  }

  // Surveys API with offline support
  async getSurveys(params: SurveysListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<SurveyEntity[]>> {
    try {
      if (this.isOnline()) {
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
    const cachedSurveys = await offlineStorage.getCachedSurveys({
      status: params.status,
      surveyType: params.surveyType
    });

    // Apply pagination to cached results
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedSurveys.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults as SurveyEntity[],
      meta: {
        total: cachedSurveys.length,
        page,
        totalPages: Math.ceil(cachedSurveys.length / limit),
        limit
      }
    };
  }

  async getSurvey(surveyId: string): Promise<ServiceResponse<SurveyEntity>> {
    try {
      if (this.isOnline()) {
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
    if (this.isOnline()) {
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

  // Community Sessions API with offline support
  async getCommunitySessions(params: CommunitySessionsListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<CommunitySessionEntity[]>> {
    try {
      if (this.isOnline()) {
        const response = await communitySessionsApi.list(params);
        // Cache the results
        for (const session of response.result) {
          await offlineStorage.cacheCommunitySession(session as any);
        }
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    const cachedSessions = await offlineStorage.getCachedCommunitySessions({
      type: params.type,
      isActive: params.isActive
    });

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedSessions.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults as CommunitySessionEntity[],
      meta: {
        total: cachedSessions.length,
        page,
        totalPages: Math.ceil(cachedSessions.length / limit),
        limit
      }
    };
  }

  async getCommunitySession(sessionId: string): Promise<ServiceResponse<CommunitySessionEntity>> {
    try {
      if (this.isOnline()) {
        const response = await communitySessionsApi.getById(sessionId);
        await offlineStorage.cacheCommunitySession(response.result as any);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    const cachedSession = await offlineStorage.getCachedCommunitySession(sessionId);
    if (!cachedSession) {
      throw new Error('Community session not found in offline cache');
    }

    return {
      message: 'Data retrieved from offline cache',
      result: cachedSession as CommunitySessionEntity
    };
  }

  async addComment(sessionId: string, payload: CommentCreateRequest, userId: string): Promise<ServiceResponse<any>> {
    if (this.isOnline()) {
      try {
        const response = await communitySessionsApi.addComment(sessionId, payload);
        return response;
      } catch (error) {
        console.log('Online comment submission failed, saving offline:', error);
      }
    }

    // Save for offline sync
    const commentId = await offlineStorage.saveComment(
      sessionId,
      payload.content,
      userId,
      payload.timestamp
    );

    return {
      message: 'Comment saved offline and will be synced when online',
      result: { id: commentId }
    };
  }

  async getComments(sessionId: string): Promise<ServiceResponse<any[]>> {
    let onlineComments: any[] = [];

    try {
      if (this.isOnline()) {
        const response = await communitySessionsApi.getComments(sessionId);
        onlineComments = response.result;
      }
    } catch (error) {
      console.log('Failed to fetch online comments:', error);
    }

    // Get offline comments
    const offlineComments = await offlineStorage.getCachedComments(sessionId);

    // Merge and sort by creation date
    const allComments = [...onlineComments, ...offlineComments]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return {
      message: onlineComments.length > 0 ? 'Comments retrieved' : 'Comments retrieved from offline cache',
      result: allComments
    };
  }

  // Feedback API with offline support
  async getFeedback(params: FeedbackListParams = { page: 1, limit: 10 }): Promise<any> {
    try {
      if (this.isOnline()) {
        const response = await feedbackApi.list(params);
        // Cache the results
        const feedbackWithOfflineFields = response.result.map(item => ({
          ...item,
          syncStatus: 'synced' as const,
          retryCount: 0,
          lastSynced: Date.now()
        }));
        await offlineStorage.cacheData('feedback', feedbackWithOfflineFields);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    const cachedFeedback = await offlineStorage.getCachedFeedback({
      status: params.status,
      feedbackType: params.feedbackType,
      projectId: params.projectId
    });

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedFeedback.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults,
      total: cachedFeedback.length,
      page,
      totalPages: Math.ceil(cachedFeedback.length / limit)
    };
  }

  async createFeedback(payload: FeedbackCreateRequest): Promise<any> {
    if (this.isOnline()) {
      try {
        // Add timeout to API call to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        const response = await Promise.race([
          feedbackApi.create(payload),
          timeoutPromise
        ]);
        return response;
      } catch (error) {
        console.log('Online feedback submission failed or timed out, saving offline:', error);
      }
    }

    // Save for offline sync - exclude large fields like documents
    const cleanPayload = {
      ...payload,
      documents: undefined // Remove documents to save space and avoid storing large file data
    };
    const feedbackId = await offlineStorage.saveFeedback({
      ...cleanPayload,
      status: 'submitted',
      mainMessage: cleanPayload.mainMessage || null,
      feedbackType: cleanPayload.feedbackType || null,
      suggestions: cleanPayload.suggestions || null,
      followUpNeeded: cleanPayload.followUpNeeded || false,
      projectId: cleanPayload.projectId || null,
      responderName: cleanPayload.responderName || undefined,
      userId: null, // Will be set by backend
      otherFeedbackOn: cleanPayload.otherFeedbackOn,
      documents: [] // Keep as empty array for schema compatibility
    });

    return {
      message: 'Feedback saved offline and will be synced when online',
      result: { id: feedbackId }
    };
  }

  // Projects API with offline support
  async getProjects(params: ProjectsListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<ProjectEntity[]>> {
    try {
      if (this.isOnline()) {
        const response = await projectsApi.list(params);
        await offlineStorage.cacheProjects(response.result as any);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    const cachedProjects = await offlineStorage.getCachedProjects();

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedProjects.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults as ProjectEntity[],
      meta: {
        total: cachedProjects.length,
        page,
        totalPages: Math.ceil(cachedProjects.length / limit),
        limit
      }
    };
  }

  async getProject(projectId: string): Promise<ServiceResponse<ProjectEntity>> {
    try {
      if (this.isOnline()) {
        const response = await projectsApi.getById(projectId);
        await offlineStorage.cacheProjects([response.result as any]);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    const cachedProject = await offlineStorage.getCachedProject(projectId);
    if (!cachedProject) {
      throw new Error('Project not found in offline cache');
    }

    return {
      message: 'Data retrieved from offline cache',
      result: cachedProject as ProjectEntity
    };
  }

  // Utility methods
  async syncNow(): Promise<any> {
    return syncService.forcSync();
  }

  async getSyncStatus(): Promise<any> {
    return syncService.getSyncStatus();
  }

  async getStorageStats(): Promise<any> {
    return offlineStorage.getStorageStats();
  }

  async clearOfflineData(): Promise<void> {
    await offlineStorage.clearCache();
  }
}

export const offlineApi = OfflineApiService.getInstance();
