import React from 'react';
import { Link } from '@tanstack/react-router';
import { FaEdit, FaEye, FaEllipsisV, FaExclamationTriangle, FaChevronRight } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

type Props = {
  paginated: any[];
  isLoading: boolean;
  getStatusColor: (s: any) => string;
  getSurveyActions: (survey: any, user: any) => any[];
  user: any;
  handleActionClick: (actionKey: string, survey: any) => void;
  // Optional route customization
  editLinkTo?: string; // e.g. '/dashboard/surveys/edit/$edit-id'
  editParamName?: string; // e.g. 'edit-id'
  viewLinkTo?: string; // e.g. '/dashboard/surveys/$view-id'
  viewParamName?: string; // e.g. 'view-id'
};

const SurveyListTable: React.FC<Props> = ({ paginated, isLoading, getStatusColor, getSurveyActions, user, handleActionClick, editLinkTo = '/dashboard/surveys/edit/$edit-id', editParamName = 'edit-id', viewLinkTo = '/dashboard/surveys/$view-id', viewParamName = 'view-id' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Remove overflow-x-auto from here and add it to inner container */}
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6">Survey Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6 hidden lg:table-cell">Responses</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6 hidden lg:table-cell">Questions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6 hidden lg:table-cell">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6 hidden lg:table-cell">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md:px-6">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {isLoading ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 md:px-6" colSpan={7}>Loading surveys...</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 text-center md:px-6" colSpan={7}>
                    <div className="flex flex-col items-center justify-center py-8">
                      <FaExclamationTriangle className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4 md:w-16 md:h-16" />
                      <span className="text-base text-gray-600 dark:text-gray-400 md:text-lg">No surveys found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((survey: any) => (
                  <tr key={survey.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{survey.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0 sm:ml-4 md:hidden">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                            {survey.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-6 hidden md:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                        {survey.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 md:px-6 hidden lg:table-cell">{(survey.responses?.length) ?? 0}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 md:px-6 hidden lg:table-cell">{survey.questionItems?.length ?? 0}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 md:px-6 hidden lg:table-cell">{survey.estimatedTime}Min</td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 md:px-6 hidden lg:table-cell">{survey.project}</td>
                    <td className="px-4 py-4 md:px-6">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <Link
                          to={editLinkTo}
                          params={{ [editParamName]: String(survey.id) } as any}
                          className="text-blue-600 dark:text-blue-400 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          title="Edit Survey"
                          aria-label={`Edit survey ${survey.title}`}
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <Link
                          to={viewLinkTo}
                          params={{ [viewParamName]: String(survey.id) } as any}
                          className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          title="View Survey"
                          aria-label={`View survey ${survey.title}`}
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        {/* Add relative positioning to the dropdown container */}
                        <div className="relative">
                          <CustomDropdown
                            trigger={
                              <button
                                className="text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 p-1 transition-colors"
                                aria-label={`More actions for survey ${survey.title}`}
                              >
                                <FaEllipsisV className="w-4 h-4" />
                              </button>
                            }
                            position="bottom-right"
                            // Add portal prop to render dropdown outside scrollable container
                            portal={true}
                            dropdownClassName="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg py-1 min-w-48 z-50 overflow-visible"
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
                                  <div className="absolute right-full top-0 ml-1 hidden group-hover:block z-50">
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
                                  onClick={() => handleActionClick(action.key, survey)}
                                  className="min-w-52"
                                >
                                  {action.label}
                                </DropdownItem>
                              )
                            ))}
                          </CustomDropdown>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SurveyListTable;