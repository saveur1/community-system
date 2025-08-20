import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { FeedbackAction, FeedbackItem } from '@/utility/types';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

interface FeedbackTableProps {
  feedbacks: FeedbackItem[];
  getStatusColor: (status: string) => string;
  getInitials: (text: string) => string;
  getActions: (fb: FeedbackItem) => FeedbackAction[];
  handleAction: (action: string, fb: FeedbackItem) => void;
}

export const FeedbackTable = ({
  feedbacks,
  getStatusColor,
  getInitials,
  getActions,
  handleAction,
}: FeedbackTableProps) => {
  return (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feedback</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Follow-up</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Response</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {feedbacks.map((fb) => (
            <tr key={fb.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(fb.programme)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{fb.programme}</div>
                    <div className="text-xs text-gray-500">{fb.feedbackType}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
                  {fb.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${fb.followUpNeeded ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {fb.followUpNeeded ? 'Needed' : 'No'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700" title={fb.response}>
                {fb.response.length > 60 ? `${fb.response.slice(0, 60)}…` : fb.response}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
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
                        onClick={() => handleAction(action.key, fb)}
                      >
                        {action.label}
                      </DropdownItem>
                    ))}
                  </CustomDropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};