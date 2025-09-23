// src/services/offline-init.ts
import { syncService } from './sync-service';
import { offlineStorage } from './offline-storage';

export class OfflineInitService {
  private static instance: OfflineInitService;
  private initialized = false;

  static getInstance(): OfflineInitService {
    if (!OfflineInitService.instance) {
      OfflineInitService.instance = new OfflineInitService();
    }
    return OfflineInitService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing offline services...');

      // Initialize database
      await this.initializeDatabase();

      // Setup service worker messaging
      await this.setupServiceWorkerMessaging();

      // Start sync service
      this.initializeSyncService();

      // Register background sync if supported
      await this.registerBackgroundSync();

      this.initialized = true;
      console.log('Offline services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize offline services:', error);
      throw error;
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Test database connection
      await offlineStorage.getStorageStats();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  private async setupServiceWorkerMessaging(): Promise<void> {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          if (event.data.action === 'START_SYNC') {
            console.log('Background sync requested by service worker');
            syncService.syncPendingData();
          }
        }
      });
    }
  }

  private initializeSyncService(): void {
    // Sync service starts automatically when instantiated
    console.log('Sync service initialized');
  }

  private async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Send message to service worker to register sync
        if (registration.active) {
          registration.active.postMessage({
            type: 'REGISTER_SYNC'
          });
        }
        
        console.log('Background sync registered');
      } catch (error) {
        console.warn('Background sync not supported or failed to register:', error);
      }
    } else {
      console.warn('Background sync not supported');
    }
  }

  async getInitializationStatus(): Promise<{
    initialized: boolean;
    databaseReady: boolean;
    syncServiceReady: boolean;
    serviceWorkerReady: boolean;
  }> {
    const databaseReady = await this.checkDatabaseStatus();
    const syncServiceReady = syncService.getNetworkStatus() !== undefined;
    const serviceWorkerReady = 'serviceWorker' in navigator && 
      (await navigator.serviceWorker.getRegistration()) !== undefined;

    return {
      initialized: this.initialized,
      databaseReady,
      syncServiceReady,
      serviceWorkerReady
    };
  }

  private async checkDatabaseStatus(): Promise<boolean> {
    try {
      await offlineStorage.getStorageStats();
      return true;
    } catch {
      return false;
    }
  }

  async clearAllOfflineData(): Promise<void> {
    await offlineStorage.clearCache();
    await syncService.clearPendingData();
    console.log('All offline data cleared');
  }
}

export const offlineInit = OfflineInitService.getInstance();
