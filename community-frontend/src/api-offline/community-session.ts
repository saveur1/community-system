// src/services/offline-api.ts
import { offlineStorage } from '../services/offline-storage';
import { communitySessionsApi, type CommunitySessionEntity, type CommunitySessionsListParams, type CommentCreateRequest } from '@/api/community-sessions';
import type { ServiceResponse } from '@/api/surveys';
import { offlineCommon } from './common';

export class OfflineApiService {
  private static instance: OfflineApiService;

  static getInstance(): OfflineApiService {
    if (!OfflineApiService.instance) {
      OfflineApiService.instance = new OfflineApiService();
    }
    return OfflineApiService.instance;
  }

  // Community Sessions API with offline support
  async getCommunitySessions(params: CommunitySessionsListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<CommunitySessionEntity[]>> {
    try {
      if (offlineCommon.isOnline()) {
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
      isActive: params.isActive,
      search: params.search
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
      if (offlineCommon.isOnline()) {
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
    if (offlineCommon.isOnline()) {
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
      if (offlineCommon.isOnline()) {
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
}

export const offlineCommunitySessionApi = OfflineApiService.getInstance();