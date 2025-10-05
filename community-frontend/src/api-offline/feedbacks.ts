// src/services/offline-api.ts
import { offlineStorage } from '../services/offline-storage';
import { feedbackApi, type FeedbackListParams, type FeedbackCreateRequest } from '@/api/feedback';
import { offlineCommon } from './common';

export class OfflineApiService {
  private static instance: OfflineApiService;

  static getInstance(): OfflineApiService {
    if (!OfflineApiService.instance) {
      OfflineApiService.instance = new OfflineApiService();
    }
    return OfflineApiService.instance;
  }

  // Feedback API with offline support
  async getFeedback(params: FeedbackListParams = { page: 1, limit: 10 }): Promise<any> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await feedbackApi.list(params);
        // Clear existing feedback data before caching new user-specific data
        await offlineStorage.clearTableData('feedback');
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
      projectId: params.projectId,
      search: params.search
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
    if (offlineCommon.isOnline()) {
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
}

export const offlineFeedbackApi = OfflineApiService.getInstance();
