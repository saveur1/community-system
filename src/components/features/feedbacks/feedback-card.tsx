import { FaEdit, FaTrash, FaEllipsisV, FaEye, FaCheck, FaCheckDouble, FaTimes, FaReply } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FeedbackAction, FeedbackItem } from '@/utility/types';
import { FeedbackEntity } from '@/api/feedback';
import FeedbackActionsDropdown from './feedback-actions-dropdown';

interface FeedbackCardProps {
  feedback: FeedbackEntity;
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackEntity) => FeedbackAction[];
  handleAction: (action: string, fb: FeedbackEntity) => void;
}

export const FeedbackCard = ({
  feedback: fb,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
}: FeedbackCardProps) => {
  const getFeedbackTypeColor = (feedbackType: string) => {
    switch (feedbackType) {
      case 'text': return 'bg-green-100 text-green-800 border border-green-200';
      case 'voice': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'video': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
            {getInitials(fb.feedbackMethod || 'No Message')}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              {fb.mainMessage || <span className="capitalize">{fb.feedbackMethod} message</span>}
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-xs inline-block px-2 py-1 rounded-xl ${getFeedbackTypeColor(fb?.feedbackMethod)}`}>
                {fb?.feedbackMethod}
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
                {fb.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* <div className="grid grid-cols-3 gap-2">
          <div className="mt-2 col-span-1">
            <span className="text-xs font-medium text-gray-500">Project:</span>
          </div>
        </div> */}
        <div className="grid grid-cols-5 gap-2 items-center pb-2">
          <span className="text-xs font-medium col-span-1 text-gray-500">Project:</span>
          <span className="col-span-3 text-sm text-gray-700">{fb.project ? fb.project.name : 'N/A'}</span>
        </div>

        <div className="grid grid-cols-5 gap-2 items-center pb-2">
          <span className="text-xs font-medium col-span-1 text-gray-500">User:</span>
          <div className="col-span-3">
            {fb.user ? (
              <div>
                <div className="text-sm font-medium text-gray-900">{fb.user.name}</div>
                <div className="text-xs text-gray-500">{fb.user.roles?.[0]?.name || 'No role'}</div>
              </div>
            ) : fb.responderName ? (
              <span className="text-sm text-gray-700">{fb.responderName}</span>
            ) : (
              <span className="text-sm text-gray-700">Unknown user</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 items-center">
          <span className="text-xs font-medium col-span-1 text-gray-500">Follow-up:</span>
          <div className="col-span-4">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fb.followUpNeeded ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
              {fb.followUpNeeded ? 'Needed' : 'No'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500"></span>
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
            handleAction={handleAction}
          />
        </div>
      </div>
    </div>
  );
};