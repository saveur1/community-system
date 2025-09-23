// src/contexts/OfflineContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { offlineInit } from '@/services/offline-init';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface OfflineContextType {
  isInitialized: boolean;
  isOnline: boolean;
  syncInProgress: boolean;
  pendingItems: number;
  forceSync: () => Promise<any>;
  retryFailedItems: () => Promise<any>;
  clearOfflineData: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const initializeOfflineServices = async () => {
      try {
        await offlineInit.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize offline services:', error);
      }
    };

    initializeOfflineServices();
  }, []);

  const clearOfflineData = async () => {
    await offlineInit.clearAllOfflineData();
  };

  const contextValue: OfflineContextType = {
    isInitialized,
    isOnline: networkStatus.isOnline,
    syncInProgress: networkStatus.syncInProgress,
    pendingItems: networkStatus.pendingItems,
    forceSync: networkStatus.forceSync,
    retryFailedItems: networkStatus.retryFailedItems,
    clearOfflineData,
  };

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
