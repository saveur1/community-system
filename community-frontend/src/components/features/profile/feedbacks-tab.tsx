import React from 'react';
import { FiMessageSquare, FiCalendar, FiStar, FiCheckCircle, FiClock } from 'react-icons/fi';

// Sample data for feedbacks
const sampleFeedbacks = [
  {
    id: '1',
    title: 'Training Program Feedback',
    message: 'The recent training on child protection was very informative and well-structured. Would love to see more sessions like this.',
    rating: 5,
    category: 'Training',
    submittedAt: '2024-01-20',
    status: 'reviewed'
  },
  {
    id: '2',
    title: 'Community Meeting Suggestion',
    message: 'Suggest having community meetings in the evening as many people work during the day.',
    rating: 4,
    category: 'Community',
    submittedAt: '2024-01-18',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Health Services Feedback',
    message: 'The mobile health clinic service has been excellent. Very accessible and professional staff.',
    rating: 5,
    category: 'Health',
    submittedAt: '2024-01-15',
    status: 'reviewed'
  }
];

export const FeedbacksTab: React.FC = () => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
          {rating}/5
        </span>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      default:
        return <FiMessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Training':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Community':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Health':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Feedbacks</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sampleFeedbacks.length} feedbacks total
        </span>
      </div>

      <div className="grid gap-4">
        {sampleFeedbacks.map((feedback) => (
          <div key={feedback.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(feedback.status)}
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {feedback.title}
                </h3>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(feedback.category)}`}>
                  {feedback.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(feedback.status)}`}>
                  {feedback.status}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feedback.message}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {renderStars(feedback.rating)}
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <FiCalendar className="w-4 h-4" />
                  <span>Submitted {new Date(feedback.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sampleFeedbacks.length === 0 && (
        <div className="text-center py-12">
          <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No feedback found</h3>
          <p className="text-gray-500 dark:text-gray-400">This user hasn't submitted any feedback yet.</p>
        </div>
      )}
    </div>
  );
};
