import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaEllipsisV, FaEye, FaShare, FaEdit, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaList, FaTh } from 'react-icons/fa';

type FeedbackItem = {
  id: number;
  name: string;
  description: string;
  email: string;
  responses: number;
  questions: number;
  time: string;
  status: 'Active' | 'Draft' | 'Completed' | 'Pending';
};

const FeedbacksPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    { id: 1, name: 'Immunization Feedback', description: 'Community feedback on immunization services', email: 'immunization@community.org', responses: 210, questions: 8, time: '4 min', status: 'Active' },
    { id: 2, name: 'Maternal Health Feedback', description: 'Assess maternal health services', email: 'maternal@community.org', responses: 145, questions: 10, time: '6 min', status: 'Draft' },
    { id: 3, name: 'Facility Experience', description: 'Feedback on facility experience', email: 'facility@community.org', responses: 320, questions: 12, time: '7 min', status: 'Completed' },
    { id: 4, name: 'Outreach Program', description: 'Program outreach effectiveness', email: 'outreach@community.org', responses: 82, questions: 6, time: '3 min', status: 'Pending' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => name.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleAction = (action: string, fb: FeedbackItem) => {
    switch (action) {
      case 'view':
      case 'share':
      case 'edit':
      case 'pause':
      case 'resume':
      case 'stop':
      case 'analytics':
      case 'export':
        alert(`${action} → ${fb.name}`);
        break;
      case 'delete':
        if (confirm(`Delete feedback: ${fb.name}?`)) {
          setFeedbacks((prev) => prev.filter((x) => x.id !== fb.id));
        }
        break;
      default:
        break;
    }
  };

  const getActions = (fb: FeedbackItem) => {
    const base = [
      { key: 'view', label: 'View Details', icon: <FaEye className="w-4 h-4" />, destructive: false },
      { key: 'share', label: 'Share', icon: <FaShare className="w-4 h-4" />, destructive: false },
      { key: 'edit', label: 'Edit', icon: <FaEdit className="w-4 h-4" />, destructive: false },
    ];
    if (fb.status === 'Active') {
      base.push({ key: 'pause', label: 'Pause', icon: <FaPause className="w-4 h-4" />, destructive: false });
      base.push({ key: 'stop', label: 'Stop', icon: <FaStop className="w-4 h-4" />, destructive: true });
    }
    if (fb.status === 'Draft' || fb.status === 'Pending') {
      base.push({ key: 'resume', label: 'Activate', icon: <FaPlay className="w-4 h-4" />, destructive: false });
    }
    if (fb.status === 'Active' || fb.status === 'Completed') {
      base.push({ key: 'analytics', label: 'Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false });
      base.push({ key: 'export', label: 'Export', icon: <FaDownload className="w-4 h-4" />, destructive: false });
    }
    base.push({ key: 'delete', label: 'Delete', icon: <FaTrash className="w-4 h-4" />, destructive: true });
    return base;
  };

  const renderTableView = () => (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Responses</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {feedbacks.map((fb) => (
            <tr key={fb.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                    {getInitials(fb.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{fb.name}</div>
                    <div className="text-xs text-gray-500">{fb.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
                  {fb.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{fb.email}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{fb.responses}</td>
              <td className="px-6 py-4">
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

  const renderGridView = () => (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {feedbacks.map((fb) => (
        <div key={fb.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-4">
              {getInitials(fb.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-700 mb-1">{fb.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fb.status)}`}>
                {fb.status}
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">{fb.description}</p>
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
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Feedbacks"]} title="Feedbacks" className='absolute top-0 left-0 w-full' />

      <div className="pt-14">
        <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-600 mr-2">Feedbacks</h2>
            <span className="text-gray-500 text-lg">({feedbacks.length})</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <FaList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <FaTh className="w-4 h-4" />
              </button>
            </div>
            <Link to="/dashboard/feedback" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2">
              <span className="text-lg">+</span>
              Create Feedback
            </Link>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}
    </div>
  );
};

export const Route = createFileRoute('/dashboard/feedback/')({
  component: FeedbacksPage,
});
