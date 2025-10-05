import React from 'react';
import { FiMessageSquare, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import type { User } from '@/api/auth';

interface FeedbacksTabProps {
  user?: User | null;
}

export const FeedbacksTab: React.FC<FeedbacksTabProps> = ({ user }) => {
  // Use real feedbacks from user data or empty array
  const feedbacks = user?.feedbacks || [];

  const getStatusIcon = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'resolved':
      case 'acknowledged':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'submitted':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      default:
        return <FiMessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'resolved':
      case 'acknowledged':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getFeedbackTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suggestion':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'concern':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Feedbacks</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {feedbacks.length} feedbacks total
        </span>
      </div>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(feedback.status)}
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {feedback.feedbackType ? `${feedback.feedbackType} Feedback` : 'Feedback'}
                </h3>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {feedback.feedbackType && (
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getFeedbackTypeColor(feedback.feedbackType)}`}>
                    {feedback.feedbackType}
                  </span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(feedback.status)}`}>
                  {feedback.status}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feedback.mainMessage || feedback.suggestions || 'No message provided'}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    feedback.feedbackMethod === 'text' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : feedback.feedbackMethod === 'voice'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {feedback.feedbackMethod}
                  </span>
                  {feedback.project && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      on {feedback.project.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <FiCalendar className="w-4 h-4" />
                  <span>{feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-12">
          <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No feedback found</h3>
          <p className="text-gray-500 dark:text-gray-400">This user hasn't submitted any feedback yet.</p>
        </div>
      )}
    </div>
  );
};
