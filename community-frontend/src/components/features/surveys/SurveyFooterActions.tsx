import type { JSX } from 'react';

interface Props {
  questionsCount: number;
  estimatedTime: string;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function SurveyFooterActions({ questionsCount, estimatedTime, isSaving, onSave, onCancel }: Props): JSX.Element {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mt-6 p-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {questionsCount} question{questionsCount !== 1 ? 's' : ''} •
          Estimated time: {estimatedTime || '0'} minutes
        </div>
        <div className="flex space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors">
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-medium flex items-center disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Survey'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

