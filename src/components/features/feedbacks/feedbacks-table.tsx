import { FaEdit, FaTrash, FaEllipsisV, FaEye, FaCheck, FaCheckDouble, FaTimes, FaReply } from 'react-icons/fa';
import { FeedbackAction, FeedbackItem } from '@/utility/types';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FeedbackEntity } from '@/api/feedback';
import FeedbackActionsDropdown from './feedback-actions-dropdown';
import { spacer } from '@/utility/logicFunctions';

interface FeedbackTableProps {
  feedbacks: FeedbackEntity[];
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackEntity) => FeedbackAction[];
  handleAction: (action: string, fb: FeedbackEntity) => void;
  isLoading?: boolean;
}

export const FeedbackTable = ({
  feedbacks,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
  isLoading,
}: FeedbackTableProps) => {

  const getFeedbackTypeColor = (feedbackType: string) => {
    switch (feedbackType) {
      case 'text': return 'bg-green-100 text-green-800 border border-green-200';
      case 'voice': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'video': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
      <table className="min-w-full table-auto">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">Feedback</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">Project</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">User</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">Status</th>
            <th className="hidden sm:table-cell px-6 py-4 text-left text-sm font-medium text-gray-900">Follow-up</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-900 sm:px-6 sm:py-4 sm:text-sm">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-5 bg-gray-200 rounded-full w-20"></div></td>
                  <td className="hidden sm:table-cell px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4"><div className="h-6 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))
            : feedbacks?.length === 0
            ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  No feedbacks found.
                </td>
              </tr>
              )
            : (feedbacks?.map((fb) => (
                <tr key={fb.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(fb.feedbackMethod || 'No Message')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">{fb.mainMessage || <span className="capitalize">{fb.feedbackMethod} message</span>}</div>
                        <div className={`text-xs inline-block px-2 py-1 rounded-xl ${getFeedbackTypeColor(fb?.feedbackMethod)}`}>{fb?.feedbackMethod}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                    {fb.project ? fb.project.name : 'N/A'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                    {fb.user ? (
                      <div>
                        <div className="font-medium text-gray-900">{fb.user.name}</div>
                        <div className="text-xs text-gray-500 capitalize">{spacer(fb.user.roles?.[0]?.name || 'No role')}</div>
                      </div>
                    ) : fb.responderName ? (
                      fb.responderName
                    ) : (
                      'Unknown user'
                    )}
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
                      {fb.status}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-700">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fb.followUpNeeded ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                      {fb.followUpNeeded ? 'Needed' : 'No'}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-6 sm:py-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleAction('edit', fb)}
                        className="text-primary hover:text-blue-700"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleAction('view', fb)}
                        className="text-gray-600 hover:text-gray-800"
                        title="View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      <FeedbackActionsDropdown 
                        fb={fb}
                        handleAction={ handleAction }
                      />
                    </div>
                  </td>
                </tr>
              )))
          }
        </tbody>
      </table>
    </div>
  );
};