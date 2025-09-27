import React from 'react';
import { FiFileText, FiCalendar, FiUsers, FiCheckCircle, FiClock, FiEdit } from 'react-icons/fi';

// Sample data for surveys
const sampleSurveys = [
  {
    id: '1',
    title: 'Community Health Assessment 2024',
    description: 'Annual health assessment survey for community members',
    status: 'completed',
    completedAt: '2024-01-15',
    responses: 45,
    category: 'Health'
  },
  {
    id: '2',
    title: 'Education Access Survey',
    description: 'Survey about access to educational resources in the community',
    status: 'in_progress',
    completedAt: null,
    responses: 23,
    category: 'Education'
  },
  {
    id: '3',
    title: 'Water & Sanitation Needs',
    description: 'Assessment of water and sanitation infrastructure needs',
    status: 'draft',
    completedAt: null,
    responses: 0,
    category: 'Infrastructure'
  }
];

export const SurveysTab: React.FC = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case 'draft':
        return <FiEdit className="w-4 h-4 text-gray-500" />;
      default:
        return <FiFileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Education':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Infrastructure':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">User Surveys</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {sampleSurveys.length} surveys total
        </span>
      </div>

      <div className="grid gap-4">
        {sampleSurveys.map((survey) => (
          <div key={survey.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(survey.status)}
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {survey.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {survey.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FiUsers className="w-4 h-4" />
                    <span>{survey.responses} responses</span>
                  </div>
                  {survey.completedAt && (
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Completed {new Date(survey.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(survey.category)}`}>
                  {survey.category}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(survey.status)}`}>
                  {survey.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sampleSurveys.length === 0 && (
        <div className="text-center py-12">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No surveys found</h3>
          <p className="text-gray-500 dark:text-gray-400">This user hasn't participated in any surveys yet.</p>
        </div>
      )}
    </div>
  );
};
