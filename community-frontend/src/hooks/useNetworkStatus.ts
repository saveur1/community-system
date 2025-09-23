// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import { syncService } from '@/services/sync-service';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  syncInProgress: boolean;
  pendingItems: number;
  lastSyncAttempt?: number;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isConnected: navigator.onLine,
    syncInProgress: false,
    pendingItems: 0
  });

  useEffect(() => {
    const updateStatus = async () => {
      const syncStatus = await syncService.getSyncStatus();
      setStatus({
        isOnline: navigator.onLine,
        isConnected: syncStatus.isOnline,
        syncInProgress: syncStatus.syncInProgress,
        pendingItems: syncStatus.pendingItems,
        lastSyncAttempt: syncStatus.lastSyncAttempt
      });
    };

    const handleOnline = () => {
      updateStatus();
    };

    const handleOffline = () => {
      updateStatus();
    };

    // Initial status update
    updateStatus();

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const forceSync = async () => {
    return syncService.forcSync();
  };

  return {
    ...status,
    forceSync
  };
}
