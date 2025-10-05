import React from 'react';
import { FiFileText, FiCalendar, FiCheckCircle } from 'react-icons/fi';
import type { User } from '@/api/auth';

interface SurveysTabProps {
  user?: User | null;
}

export const SurveysTab: React.FC<SurveysTabProps> = ({ user }) => {
  // Use real survey responses from user data or empty array
  const surveyResponses = user?.surveyResponses || [];
  const getSurveyTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'report-form':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'general':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'rapid-enquiry':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Survey Responses</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {surveyResponses.length} responses total
        </span>
      </div>

      <div className="grid gap-4">
        {surveyResponses.map((response) => (
          <div key={response.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <FiCheckCircle className="w-4 h-4 text-green-500" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {response.survey?.title || 'Survey Response'}
                  </h3>
                </div>
                {response.survey?.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {response.survey.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>Submitted {response.createdAt ? new Date(response.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {response.survey?.surveyType && (
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${getSurveyTypeColor(response.survey.surveyType)}`}>
                    {response.survey.surveyType.replace('-', ' ')}
                  </span>
                )}
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Completed
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {surveyResponses.length === 0 && (
        <div className="text-center py-12">
          <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No surveys found</h3>
          <p className="text-gray-500 dark:text-gray-400">This user hasn't participated in any surveys yet.</p>
        </div>
      )}
    </div>
  );
};
