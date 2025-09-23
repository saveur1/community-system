// src/components/NetworkStatusIndicator.tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatusIndicator() {
  const { isOnline, syncInProgress, pendingItems, forceSync, retryFailedItems } = useNetworkStatus();

  if (isOnline && pendingItems === 0) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg max-w-sm ${
      isOnline ? 'bg-yellow-100 border-yellow-400' : 'bg-red-100 border-red-400'
    } border`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          isOnline ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isOnline ? 'text-yellow-800' : 'text-red-800'
          }`}>
            {isOnline ? 'Syncing...' : 'Offline Mode'}
          </p>
          {pendingItems > 0 && (
            <p className={`text-xs ${
              isOnline ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {pendingItems} item{pendingItems !== 1 ? 's' : ''} pending sync
            </p>
          )}
          {syncInProgress && (
            <p className="text-xs text-blue-600">Syncing in progress...</p>
          )}
        </div>
        {isOnline && pendingItems > 0 && !syncInProgress && (
          <button
            onClick={forceSync}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Sync Now
          </button>
        )}
        {isOnline && (
          <button
            onClick={retryFailedItems}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
          >
            Retry Failed
          </button>
        )}
      </div>
    </div>
  );
}
