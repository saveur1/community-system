// src/services/sync-service.ts
import { offlineStorage } from './offline-storage';
import { surveysApi } from '@/api/surveys';
import { communitySessionsApi } from '@/api/community-sessions';
import { feedbackApi } from '@/api/feedback';
import type { SyncQueue } from '@/db/schema';

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ entityType: string; entityId: string; error: string }>;
}

export class SyncService {
  private static instance: SyncService;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly maxRetries = 10; // Increased from 3 to allow more retries before giving up
//   private readonly _retryDelay = 5000; // 5 seconds

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  constructor() {
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Network: Back online, starting sync...');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('Network: Gone offline');
    });
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingData();
      }
    }, 30000);
  }

  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  public async syncPendingData(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, synced: 0, failed: 0, errors: [{ entityType: 'system', entityId: 'sync', error: 'Sync already in progress' }] };
    }
    
    if (!this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: [{ entityType: 'system', entityId: 'network', error: 'Device is offline' }] };
    }

    this.syncInProgress = true;
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] };

    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      
      for (const item of syncQueue) {
        try {
          const success = await this.syncItem(item);
          if (success) {
            result.synced++;
            await offlineStorage.removeSyncQueueItem(item.id!);
            await offlineStorage.markSynced(item.entityType, item.entityId);
          } else {
            result.failed++;
            await this.handleSyncFailure(item, 'Sync failed');
          }
        } catch (error) {
          result.failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push({
            entityType: item.entityType,
            entityId: item.entityId,
            error: errorMessage
          });
          await this.handleSyncFailure(item, errorMessage);
        }
      }
      
      // Update last sync timestamp
      await offlineStorage.setMetadata('lastSyncAttempt', Date.now());
      
    } catch (error) {
      result.success = false;
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async syncItem(item: SyncQueue): Promise<boolean> {
    try {
      switch (item.entityType) {
        case 'surveyResponse':
          return await this.syncSurveyResponse(item);
        case 'comment':
          return await this.syncComment(item);
        case 'feedback':
          return await this.syncFeedback(item);
        case 'survey':
          return await this.syncSurvey(item);
        case 'communitySession':
          return await this.syncCommunitySession(item);
        case 'project':
          return await this.syncProject(item);
        default:
          console.warn(`Unknown entity type: ${item.entityType}`);
          return false;
      }
    } catch (error) {
      console.error(`Failed to sync ${item.entityType} ${item.entityId}:`, error);
      return false;
    }
  }

  private async syncSurveyResponse(item: SyncQueue): Promise<boolean> {
    const { surveyId, answers } = item.data;
    
    try {
      await surveysApi.submitAnswers(surveyId, { answers });
      return true;
    } catch (error) {
      console.error('Failed to sync survey response:', error);
      return false;
    }
  }

  private async syncComment(item: SyncQueue): Promise<boolean> {
    const { communitySessionId, content, timestamp } = item.data;
    
    try {
      await communitySessionsApi.addComment(communitySessionId, {
        content,
        timestamp
      });
      return true;
    } catch (error) {
      console.error('Failed to sync comment:', error);
      return false;
    }
  }

  private async syncFeedback(item: SyncQueue): Promise<boolean> {
    const feedbackData = item.data;
    
    try {
      // Remove offline-specific fields
      const { syncStatus, retryCount, lastSynced,status,userId, createdAt, updatedAt,id, ...cleanData } = feedbackData;
      await feedbackApi.create(cleanData);
      return true;
    } catch (error) {
      console.error('Failed to sync feedback:', error);
      return false;
    }
  }

  private async syncSurvey(_item: SyncQueue): Promise<boolean> {
    // Supports queued updates and deletes for surveys
    const item = _item;
    try {
      if (item.action === 'update') {
        const { id, payload } = item.data || {};
        if (!id) throw new Error('Missing survey id for update');
        await surveysApi.update(id, payload || {});
        return true;
      }
      if (item.action === 'delete') {
        const { id } = item.data || {};
        const targetId = id || item.entityId;
        if (!targetId) throw new Error('Missing survey id for delete');
        await surveysApi.remove(targetId);
        return true;
      }
      console.warn('Unknown survey sync action:', item.action);
      return false;
    } catch (error) {
      console.error('Failed to sync survey:', error);
      return false;
    }
  }

  private async syncCommunitySession(_item: SyncQueue): Promise<boolean> {
    // Handle community session creation/updates if needed
    console.log('Community session sync not implemented yet');
    return false;
  }

  private async syncProject(_item: SyncQueue): Promise<boolean> {
    // Handle project creation/updates if needed
    console.log('Project sync not implemented yet');
    return false;
  }

  private async handleSyncFailure(item: SyncQueue, error: string): Promise<void> {
    const newRetryCount = item.retryCount + 1;
    
    // NEVER remove items from sync queue - keep them forever until successfully synced
    // This ensures data is never lost, even after weeks offline
    
    // Calculate exponential backoff delay (max 1 hour)
    const delay = Math.min(5000 * Math.pow(2, newRetryCount - 1), 3600000);
    
    console.log(`Sync failed for ${item.entityType} ${item.entityId}, retry ${newRetryCount} in ${delay / 1000} seconds`);
    
    // Update retry count and last attempt time, but keep item in queue
    await offlineStorage.updateSyncQueueItem(item.id!, {
      retryCount: newRetryCount,
      lastAttempt: Date.now(),
      error
    });
    
    // Mark the entity as failed but don't remove from sync queue
    if (newRetryCount >= this.maxRetries) {
      console.warn(`${item.entityType} ${item.entityId} has failed ${this.maxRetries} times but will keep retrying`);
      await offlineStorage.markSyncFailed(item.entityType, item.entityId, error);
    }
  }

  // Manual sync trigger
  public async forcSync(): Promise<SyncResult> {
    return this.syncPendingData();
  }

  // Check if there's pending data to sync
  public async hasPendingData(): Promise<boolean> {
    const syncQueue = await offlineStorage.getSyncQueue();
    return syncQueue.length > 0;
  }

  // Get sync status
  public async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    pendingItems: number;
    lastSyncAttempt?: number;
  }> {
    const syncQueue = await offlineStorage.getSyncQueue();
    const lastSyncAttempt = await offlineStorage.getMetadata('lastSyncAttempt');
    
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingItems: syncQueue.length,
      lastSyncAttempt
    };
  }

  // Retry failed items
  public async retryFailedItems(): Promise<SyncResult> {
    const failedResponses = await offlineStorage.getPendingSurveyResponses();
    const failedComments = await offlineStorage.getPendingComments();
    const failedFeedback = await offlineStorage.getPendingFeedback();

    // Reset retry counts for failed items
    for (const response of failedResponses.filter(r => r.syncStatus === 'failed')) {
      await offlineStorage.addToSyncQueue('surveyResponse', response.id, 'create', response);
    }

    for (const comment of failedComments.filter(c => c.syncStatus === 'failed')) {
      await offlineStorage.addToSyncQueue('comment', comment.id, 'create', comment);
    }

    for (const feedback of failedFeedback.filter(f => f.syncStatus === 'failed')) {
      await offlineStorage.addToSyncQueue('feedback', feedback.id, 'create', feedback);
    }

    return this.syncPendingData();
  }

  // Clear all pending sync data (use with EXTREME caution - this will cause data loss!)
  public async clearPendingData(): Promise<void> {
    console.warn('⚠️ CLEARING ALL PENDING SYNC DATA - THIS WILL CAUSE DATA LOSS!');
    const syncQueue = await offlineStorage.getSyncQueue();
    for (const item of syncQueue) {
      await offlineStorage.removeSyncQueueItem(item.id!);
    }
  }

  // Clear specific item from sync queue (use with caution)
  public async clearSpecificItem(entityType: string, entityId: string): Promise<void> {
    console.warn(`⚠️ Clearing specific item from sync queue: ${entityType}:${entityId}`);
    const syncQueue = await offlineStorage.getSyncQueue();
    const item = syncQueue.find(i => i.entityType === entityType && i.entityId === entityId);
    if (item?.id) {
      await offlineStorage.removeSyncQueueItem(item.id);
    }
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

export const syncService = SyncService.getInstance();
