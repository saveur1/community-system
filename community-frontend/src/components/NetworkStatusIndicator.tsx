// src/components/NetworkStatusIndicator.tsx
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from 'react-toastify';

export function NetworkStatusIndicator() {
  const { isOnline, syncInProgress, pendingItems, forceSync } = useNetworkStatus();

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
        {pendingItems > 0 && !syncInProgress && (
          <button
            onClick={async () => {
              if (!isOnline) {
                toast.warning('You are offline. Data will sync automatically when connection is restored.');
                return;
              }
              try {
                const result = await forceSync();
                if (result.success) {
                  toast.success(`Synced ${result.synced} items successfully`);
                } else {
                  toast.error('Sync failed. Will retry automatically when online.');
                }
              } catch (error) {
                toast.error('Sync failed. Will retry automatically when online.');
              }
            }}
            className={`text-xs px-2 py-1 rounded ${
              isOnline 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={syncInProgress}
          >
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </button>
        )}
      </div>
    </div>
  );
}
