import React from 'react';

interface OfflineIndicatorProps {
  title?: string;
  message?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ 
  title = "Page Not Available Offline",
  message = "This page requires an internet connection to function properly. Please check your connection and try again."
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 py-8">
      {/* Offline SVG Image */}
      <div className="mb-4">
        <img 
          src="/images/offline.svg" 
          alt="Offline" 
          className="w-40 h-40 md:w-56 md:h-56 opacity-60 dark:opacity-40"
        />
      </div>
      
      {/* Title */}
      <h2 className="text-xl md:text-2xl font-semibold text-title dark:text-gray-200 mb-4 text-center">
        {title}
      </h2>
      
      {/* Message */}
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed">
        {message}
      </p>
      
      {/* Connection Status */}
      <div className="mt-6 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 dark:text-red-300 font-medium">
            No Internet Connection
          </span>
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;
