// src/components/OfflineStatusBar.tsx
import { useOffline } from '@/providers/OfflineContext';

export function OfflineStatusBar() {
  const { isOnline, syncInProgress, pendingItems, forceSync } = useOffline();

  if (isOnline && pendingItems === 0 && !syncInProgress) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-400' : 'bg-red-400'
            } ${syncInProgress ? 'animate-pulse' : ''}`} />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              {!isOnline && 'Working offline'}
              {isOnline && syncInProgress && 'Syncing data...'}
              {isOnline && !syncInProgress && pendingItems > 0 && 
                `${pendingItems} item${pendingItems !== 1 ? 's' : ''} pending sync`}
            </p>
          </div>
        </div>
        
        {isOnline && pendingItems > 0 && !syncInProgress && (
          <div className="flex space-x-2">
            <button
              onClick={forceSync}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Sync Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
