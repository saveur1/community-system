// src/services/offline-storage.ts
import { db, type OfflineSurvey, type OfflineSurveyResponse, type OfflineCommunitySession, type OfflineComment, type OfflineFeedback, type OfflineProject, type OfflineStatisticsOverview, type OfflineSurveysHistory, type SyncQueue } from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

export class OfflineStorageService {
  private static instance: OfflineStorageService;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  // Generic cache methods
  async cacheData<T extends { id: string }>(table: string, data: T[], lastSynced?: number): Promise<void> {
    const timestamp = lastSynced || Date.now();
    const dataWithTimestamp = data.map(item => ({
      ...item,
      lastSynced: timestamp
    }));

    switch (table) {
      case 'surveys':
        await db.surveys.bulkPut(dataWithTimestamp as unknown as OfflineSurvey[]);
        break;
      case 'communitySessions':
        await db.communitySessions.bulkPut(dataWithTimestamp as unknown as OfflineCommunitySession[]);
        break;
      case 'feedback':
        await db.feedback.bulkPut(dataWithTimestamp as unknown as OfflineFeedback[]);
        break;
      case 'projects':
        await db.projects.bulkPut(dataWithTimestamp as unknown as OfflineProject[]);
        break;
      case 'statisticsOverview':
        await db.statisticsOverview.bulkPut(dataWithTimestamp as unknown as OfflineStatisticsOverview[]);
        break;
      case 'surveysHistory':
        await db.surveysHistory.bulkPut(dataWithTimestamp as unknown as OfflineSurveysHistory[]);
        break;
    }
  }

  async getCachedData<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    let collection: any;
    
    switch (table) {
      case 'surveys':
        collection = db.surveys;
        break;
      case 'communitySessions':
        collection = db.communitySessions;
        break;
      case 'feedback':
        collection = db.feedback;
        break;
      case 'projects':
        collection = db.projects;
        break;
      case 'statisticsOverview':
        collection = db.statisticsOverview;
        break;
      case 'surveysHistory':
        collection = db.surveysHistory;
        break;
      default:
        throw new Error(`Unknown table: ${table}`);
    }

    if (filters) {
      // Apply basic filters
      let query = collection.toCollection();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.filter((item: any) => item[key] === value);
        }
      });
      
      return query.toArray() as Promise<T[]>;
    }

    return collection.toArray() as Promise<T[]>;
  }

  async getCachedItem<T>(table: string, id: string): Promise<T | undefined> {
    switch (table) {
      case 'surveys':
        return db.surveys.get(id) as Promise<T | undefined>;
      case 'communitySessions':
        return db.communitySessions.get(id) as Promise<T | undefined>;
      case 'feedback':
        return db.feedback.get(id) as Promise<T | undefined>;
      case 'projects':
        return db.projects.get(id) as Promise<T | undefined>;
      case 'statisticsOverview':
        return db.statisticsOverview.get(id) as Promise<T | undefined>;
      case 'surveysHistory':
        return db.surveysHistory.get(id) as Promise<T | undefined>;
      default:
        throw new Error(`Unknown table: ${table}`);
    }
  }

  // Survey-specific methods
  async cacheSurveys(surveys: OfflineSurvey[]): Promise<void> {
    await this.cacheData('surveys', surveys);
  }

  async getCachedSurveys(filters?: { status?: string; surveyType?: string }): Promise<OfflineSurvey[]> {
    return this.getCachedData<OfflineSurvey>('surveys', filters);
  }

  async getCachedSurvey(id: string): Promise<OfflineSurvey | undefined> {
    return this.getCachedItem<OfflineSurvey>('surveys', id);
  }

  // Survey responses (offline submissions)
  async saveSurveyResponse(surveyId: string, answers: any[], userId?: string): Promise<string> {
    const responseId = uuidv4();
    const response: OfflineSurveyResponse = {
      id: responseId,
      surveyId,
      userId: userId || null,
      answers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    };

    await db.surveyResponses.put(response);
    await this.addToSyncQueue('surveyResponse', responseId, 'create', response);
    return responseId;
  }

  async getPendingSurveyResponses(): Promise<OfflineSurveyResponse[]> {
    return db.surveyResponses.where('syncStatus').equals('pending').toArray();
  }

  // Cache survey responses fetched from server for offline viewing
  async cacheSurveyResponses(responses: OfflineSurveyResponse[], lastSynced?: number): Promise<void> {
    const timestamp = lastSynced || Date.now();
    const normalized = responses.map(r => ({
      ...r,
      syncStatus: r.syncStatus || 'synced',
      retryCount: r.retryCount ?? 0,
      lastSynced: timestamp,
      createdAt: r.createdAt || new Date().toISOString(),
      updatedAt: r.updatedAt || new Date().toISOString(),
    }));
    await db.surveyResponses.bulkPut(normalized);
  }

  async getCachedSurveyResponses(filters?: { surveyId?: string; responderId?: string }): Promise<OfflineSurveyResponse[]> {
    let collection = db.surveyResponses.toCollection();
    if (filters?.surveyId) {
      collection = db.surveyResponses.where('surveyId').equals(filters.surveyId);
    }
    let results = await collection.toArray();
    if (filters?.responderId !== undefined) {
      results = results.filter(r => (r.userId || null) === filters.responderId);
    }
    // Prefer most recent first
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return results;
  }

  async getCachedResponseById(responseId: string): Promise<OfflineSurveyResponse | undefined> {
    return db.surveyResponses.get(responseId);
  }

  // Community Sessions
  async cacheCommunitySession(session: OfflineCommunitySession): Promise<void> {
    await db.communitySessions.put({ ...session, lastSynced: Date.now() });
  }

  async getCachedCommunitySessions(filters?: { type?: string; isActive?: boolean }): Promise<OfflineCommunitySession[]> {
    return this.getCachedData<OfflineCommunitySession>('communitySessions', filters);
  }

  async getCachedCommunitySession(id: string): Promise<OfflineCommunitySession | undefined> {
    return this.getCachedItem<OfflineCommunitySession>('communitySessions', id);
  }

  // Comments (offline submissions)
  async saveComment(communitySessionId: string, content: string, userId: string, timestamp?: number): Promise<string> {
    const commentId = uuidv4();
    const comment: OfflineComment = {
      id: commentId,
      content,
      communitySessionId,
      userId,
      timestamp,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    };

    await db.comments.put(comment);
    await this.addToSyncQueue('comment', commentId, 'create', comment);
    return commentId;
  }

  async getCachedComments(communitySessionId: string): Promise<OfflineComment[]> {
    return db.comments
      .where('communitySessionId')
      .equals(communitySessionId)
      .and(comment => comment.isActive)
      .toArray();
  }

  async getPendingComments(): Promise<OfflineComment[]> {
    return db.comments.where('syncStatus').equals('pending').toArray();
  }

  // Feedback (offline submissions)
  async saveFeedback(feedbackData: Omit<OfflineFeedback, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus' | 'retryCount'>): Promise<string> {
    const feedbackId = uuidv4();
    const feedback: OfflineFeedback = {
      ...feedbackData,
      id: feedbackId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0
    };

    await db.feedback.put(feedback);
    await this.addToSyncQueue('feedback', feedbackId, 'create', feedback);
    return feedbackId;
  }

  async getCachedFeedback(filters?: { status?: string; feedbackType?: string; projectId?: string; search?: string }): Promise<OfflineFeedback[]> {
    let feedbackData = await this.getCachedData<OfflineFeedback>('feedback', {
      status: filters?.status,
      feedbackType: filters?.feedbackType,
      projectId: filters?.projectId
    });

    // Apply search filter if provided
    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      feedbackData = feedbackData.filter(feedback => {
        // Search in feedback content
        const mainMessage = feedback.mainMessage?.toLowerCase() || '';
        const suggestions = feedback.suggestions?.toLowerCase() || '';
        const otherFeedbackOn = feedback.otherFeedbackOn?.toLowerCase() || '';
        const responderName = feedback.responderName?.toLowerCase() || '';
        
        return mainMessage.includes(searchTerm) ||
               suggestions.includes(searchTerm) ||
               otherFeedbackOn.includes(searchTerm) ||
               responderName.includes(searchTerm);
      });
    }

    return feedbackData;
  }

  async getPendingFeedback(): Promise<OfflineFeedback[]> {
    return db.feedback.where('syncStatus').equals('pending').toArray();
  }

  // Projects
  async cacheProjects(projects: OfflineProject[]): Promise<void> {
    await this.cacheData('projects', projects);
  }

  async getCachedProjects(): Promise<OfflineProject[]> {
    return this.getCachedData<OfflineProject>('projects');
  }

  async getCachedProject(id: string): Promise<OfflineProject | undefined> {
    return this.getCachedItem<OfflineProject>('projects', id);
  }

  // Statistics Overview
  async cacheStatisticsOverview(overview: OfflineStatisticsOverview): Promise<void> {
    const dataToCache = { ...overview, lastSynced: Date.now() };
    await db.statisticsOverview.put(dataToCache);
  }

  async getCachedStatisticsOverview(id: string): Promise<OfflineStatisticsOverview | undefined> {
    const result = await this.getCachedItem<OfflineStatisticsOverview>('statisticsOverview', id);
    return result;
  }

  // Surveys History
  async cacheSurveysHistory(history: OfflineSurveysHistory): Promise<void> {
    await db.surveysHistory.put({ ...history, lastSynced: Date.now() });
  }

  async getCachedSurveysHistory(id: string): Promise<OfflineSurveysHistory | undefined> {
    return this.getCachedItem<OfflineSurveysHistory>('surveysHistory', id);
  }

  // Sync queue management
  async addToSyncQueue(entityType: SyncQueue['entityType'], entityId: string, action: SyncQueue['action'], data: any): Promise<void> {
    const queueItem: SyncQueue = {
      entityType,
      entityId,
      action,
      data,
      retryCount: 0,
      createdAt: Date.now()
    };

    await db.syncQueue.add(queueItem);
  }

  async getSyncQueue(): Promise<SyncQueue[]> {
    return db.syncQueue.orderBy('createdAt').toArray();
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    await db.syncQueue.delete(id);
  }

  async updateSyncQueueItem(id: number, updates: Partial<SyncQueue>): Promise<void> {
    await db.syncQueue.update(id, updates);
  }

  // Metadata management
  async setMetadata(key: string, value: any): Promise<void> {
    await db.metadata.put({
      key,
      value,
      updatedAt: Date.now()
    });
  }

  async getMetadata(key: string): Promise<any> {
    const item = await db.metadata.where('key').equals(key).first();
    return item?.value;
  }

  // Utility methods
  async clearCache(): Promise<void> {
    await db.surveys.clear();
    await db.communitySessions.clear();
    await db.feedback.clear();
    await db.projects.clear();
    await db.statisticsOverview.clear();
    await db.surveysHistory.clear();
    await db.comments.clear();
    await db.surveyResponses.clear();
  }

  async getStorageStats(): Promise<{
    surveys: number;
    communitySessions: number;
    feedback: number;
    projects: number;
    statisticsOverview: number;
    surveysHistory: number;
    pendingSync: number;
  }> {
    const [surveys, communitySessions, feedback, projects, statisticsOverview, surveysHistory, pendingSync] = await Promise.all([
      db.surveys.count(),
      db.communitySessions.count(),
      db.feedback.count(),
      db.projects.count(),
      db.statisticsOverview.count(),
      db.surveysHistory.count(),
      db.syncQueue.count()
    ]);

    return {
      surveys,
      communitySessions,
      feedback,
      projects,
      statisticsOverview,
      surveysHistory,
      pendingSync
    };
  }

  // Mark items as synced
  async markSynced(entityType: string, entityId: string): Promise<void> {
    const timestamp = Date.now();
    
    switch (entityType) {
      case 'surveyResponse':
        await db.surveyResponses.update(entityId, { 
          syncStatus: 'synced', 
          lastSynced: timestamp 
        });
        break;
      case 'comment':
        await db.comments.update(entityId, { 
          syncStatus: 'synced', 
          lastSynced: timestamp 
        });
        break;
      case 'feedback':
        await db.feedback.update(entityId, { 
          syncStatus: 'synced', 
          lastSynced: timestamp 
        });
        break;
    }
  }

  async markSyncFailed(entityType: string, entityId: string, _error: string): Promise<void> {
    switch (entityType) {
      case 'surveyResponse':
        await db.surveyResponses.where('id').equals(entityId).modify(item => {
          item.syncStatus = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
        });
        break;
      case 'comment':
        await db.comments.where('id').equals(entityId).modify(item => {
          item.syncStatus = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
        });
        break;
      case 'feedback':
        await db.feedback.where('id').equals(entityId).modify(item => {
          item.syncStatus = 'failed';
          item.retryCount = (item.retryCount || 0) + 1;
        });
        break;
    }
  }
}

export const offlineStorage = OfflineStorageService.getInstance();
