import React from 'react';
import { Link } from '@tanstack/react-router';
import { FaEdit, FaTrash, FaEllipsisV, FaExclamationTriangle, FaChevronRight } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

type Props = {
  paginated: any[];
  isLoading: boolean;
  getInitials: (s: string) => string;
  getStatusColor: (s: any) => string;
  getSurveyActions: (survey: any, user: any) => any[];
  user: any;
  handleActionClick: (actionKey: string, survey: any) => void;
};

const SurveyGridCard: React.FC<Props> = ({ paginated, isLoading, getInitials, getStatusColor, getSurveyActions, user, handleActionClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {isLoading ? (
        <div className="col-span-full text-sm text-gray-500 dark:text-gray-400">Loading surveys...</div>
      ) : paginated.length === 0 ? (
        <div className="col-span-full text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <FaExclamationTriangle className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
            <span className="text-lg text-gray-600 dark:text-gray-400">No surveys found</span>
          </div>
        </div>
      ) : (
        paginated.map((survey: any) => (
          <div key={survey.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary dark:bg-primary/80 flex items-center justify-center text-white text-lg font-medium mr-4">
                {getInitials(survey.title)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-1">{survey.title}</h3>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                  {survey.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{survey.description}</p>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{survey.questionItems?.length ?? 0} questions</span>
                <span>{survey.estimatedTime}Min to complete</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">{(survey.answers?.length) ?? 0}</span> responses received
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-500 dark:text-gray-400">{survey?.project?.name}</span>
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard/surveys/edit/$edit-id"
                  params={{ 'edit-id': String(survey.id) }}
                  className="text-primary dark:text-primary-200 hover:text-blue-700 dark:hover:text-primary-300"
                  title="Edit Survey"
                >
                  <FaEdit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleActionClick('delete', survey)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Delete Survey"
                >
                  <FaTrash className="w-4 h-4" />
                </button>

                <CustomDropdown
                  trigger={
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                      <FaEllipsisV className="w-4 h-4" />
                    </button>
                  }
                  position="bottom-right"
                  dropdownClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-48 overflow-visible"
                >
                  {getSurveyActions(survey, user).map((action) => (
                    action.hasSubmenu ? (
                      <div key={action.key} className="relative group">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-3">
                            {action.icon}
                            <span>{action.label}</span>
                          </div>
                          <FaChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="absolute left-full top-0 ml-1 hidden group-hover:block z-50">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-40">
                            {action.submenu?.map((subAction: any) => (
                              <DropdownItem
                                key={subAction.key}
                                icon={subAction.icon}
                                onClick={() => handleActionClick(subAction.key, survey)}
                              >
                                {subAction.label}
                              </DropdownItem>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <DropdownItem
                        key={action.key}
                        icon={action.icon}
                        destructive={action.destructive}
                        className='min-w-52'
                        onClick={() => handleActionClick(action.key, survey)}
                      >
                        {action.label}
                      </DropdownItem>
                    )
                  ))}
                </CustomDropdown>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SurveyGridCard;