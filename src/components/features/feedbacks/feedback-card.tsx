import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FeedbackAction, FeedbackItem } from '@/utility/types';

interface FeedbackCardProps {
  feedback: FeedbackItem;
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackItem) => FeedbackAction[];
  handleAction: (action: string, fb: FeedbackItem) => void;
}

export const FeedbackCard = ({
  feedback: fb,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
}: FeedbackCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-4">
          {getInitials(fb.programme)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-700 mb-1">{fb.programme}</h3>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
            {fb.status}
          </span>
        </div>
      </div>
      <div className="space-y-3 mb-4">
        <p className="text-sm text-gray-600">{fb.feedbackType} — {fb.response}</p>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{fb.questions} questions</span>
          <span>{fb.time} to complete</span>
        </div>
        <div className="text-sm text-gray-700">
          <span className="font-medium">{fb.responses}</span> responses received
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <span className="text-sm text-gray-500">{fb.email}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAction('edit', fb)}
            className="text-primary hover:text-blue-700"
            title="Edit"
          >
            <FaEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAction('delete', fb)}
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
          <CustomDropdown
            trigger={
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <FaEllipsisV className="w-4 h-4" />
              </button>
            }
            position="bottom-right"
            dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
          >
            {getActions(fb).map((action) => (
              <DropdownItem
                key={action.key}
                icon={action.icon}
                destructive={action.destructive}
                className='min-w-52'
                onClick={() => handleAction(action.key, fb)}
              >
                {action.label}
              </DropdownItem>
            ))}
          </CustomDropdown>
        </div>
      </div>
    </div>
  );
};