import React from 'react';
import { FiActivity, FiClock, FiMonitor, FiMapPin, FiLogIn, FiEdit, FiFileText, FiMessageSquare } from 'react-icons/fi';

// Sample data for system logs/activities
const sampleActivities = [
  {
    id: '1',
    action: 'Login',
    description: 'User logged into the system',
    timestamp: '2024-01-22 09:30:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '2',
    action: 'Profile Update',
    description: 'Updated profile information',
    timestamp: '2024-01-21 14:15:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '3',
    action: 'Survey Submission',
    description: 'Completed Community Health Assessment survey',
    timestamp: '2024-01-20 16:45:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '4',
    action: 'Feedback Submission',
    description: 'Submitted feedback for Training Program',
    timestamp: '2024-01-20 11:20:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: '5',
    action: 'Password Change',
    description: 'User changed their password',
    timestamp: '2024-01-19 08:45:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];

export const ActivitiesTab: React.FC = () => {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return <FiLogIn className="w-4 h-4 text-green-500" />;
      case 'profile update':
        return <FiEdit className="w-4 h-4 text-blue-500" />;
      case 'survey submission':
        return <FiFileText className="w-4 h-4 text-purple-500" />;
      case 'feedback submission':
        return <FiMessageSquare className="w-4 h-4 text-orange-500" />;
      case 'password change':
        return <FiEdit className="w-4 h-4 text-red-500" />;
      default:
        return <FiActivity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'profile update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'survey submission':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'feedback submission':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'password change':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Activities</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sampleActivities.length} activities logged
        </span>
      </div>

      <div className="space-y-4">
        {sampleActivities.map((activity) => {
          const { date, time } = formatTimestamp(activity.timestamp);
          return (
            <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getActionIcon(activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {activity.action}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>{date} at {time}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiMapPin className="w-4 h-4" />
                      <span>IP: {activity.ipAddress}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMonitor className="w-4 h-4" />
                      <span>{getBrowserInfo(activity.userAgent)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sampleActivities.length === 0 && (
        <div className="text-center py-12">
          <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No activities found</h3>
          <p className="text-gray-500 dark:text-gray-400">No system activities have been logged for this user yet.</p>
        </div>
      )}
    </div>
  );
};
