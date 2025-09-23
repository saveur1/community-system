// src/api-offline/common.ts
import { syncService } from '@/services/sync-service';

export const offlineCommon = {
  isOnline(): boolean {
    // Prefer syncService status, fallback to navigator.onLine
    try {
      const s = syncService?.getNetworkStatus();
      if (typeof s === 'boolean') return s;
    } catch { /* ignore */ }
    return typeof navigator !== 'undefined' ? navigator.onLine : false;
  }
};
