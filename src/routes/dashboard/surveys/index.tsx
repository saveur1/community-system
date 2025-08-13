import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link } from '@tanstack/react-router'
import { FaPoll, FaCheckCircle, FaList, FaTh, FaEdit, FaTrash, FaEllipsisV, FaEye, FaCopy, FaShare, FaPause, FaPlay, FaStop, FaDownload, FaChartBar } from 'react-icons/fa';
import { useState } from 'react';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import DeleteSurveyModal from '@/components/pages/surveys/delete-survey-modal';

const SurveyComponent = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);

    // Sample data for surveys - updated to match the contact list structure
    const [surveys, setSurveys] = useState([
        {
            id: 1,
            name: 'Customer Satisfaction Survey',
            position: 'Active Survey',
            email: 'customer.survey@company.com',
            projects: 125,
            description: 'Share your experience with our services',
            questions: 10,
            time: '5 min',
            avatar: null,
            status: 'Active'
        },
        {
            id: 2,
            name: 'Product Feedback Survey',
            position: 'Draft Survey',
            email: 'product.feedback@company.com',
            projects: 132,
            description: 'Help us improve our products',
            questions: 8,
            time: '4 min',
            avatar: null,
            status: 'Draft'
        },
        {
            id: 3,
            name: 'User Experience Survey',
            position: 'Completed Survey',
            email: 'ux.survey@company.com',
            projects: 112,
            description: 'Tell us about your app usage',
            questions: 12,
            time: '6 min',
            avatar: null,
            status: 'Completed'
        },
        {
            id: 4,
            name: 'Website Usability Test',
            position: 'Active Survey',
            email: 'usability@company.com',
            projects: 121,
            description: 'Test our website interface',
            questions: 15,
            time: '8 min',
            avatar: null,
            status: 'Active'
        },
        {
            id: 5,
            name: 'Service Quality Assessment',
            position: 'Pending Survey',
            email: 'service.quality@company.com',
            projects: 145,
            description: 'Rate our service quality',
            questions: 6,
            time: '3 min',
            avatar: null,
            status: 'Pending'
        },
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

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleSurveyAction = (action: string, surveyId: number, surveyName: string) => {
        console.log(`${action} action for survey:`, surveyId, surveyName);
        // Handle different actions
        switch (action) {
            case 'view':
                alert(`Viewing details for: ${surveyName}`);
                break;
            case 'edit':
                alert(`Editing survey: ${surveyName}`);
                break;
            case 'duplicate':
                alert(`Duplicating survey: ${surveyName}`);
                break;
            case 'share':
                alert(`Sharing survey: ${surveyName}`);
                break;
            case 'pause':
                alert(`Pausing survey: ${surveyName}`);
                break;
            case 'resume':
                alert(`Resuming survey: ${surveyName}`);
                break;
            case 'stop':
                alert(`Stopping survey: ${surveyName}`);
                break;
            case 'analytics':
                alert(`Viewing analytics for: ${surveyName}`);
                break;
            case 'export':
                alert(`Exporting data for: ${surveyName}`);
                break;
            case 'delete':
                setToDelete({ id: surveyId, name: surveyName });
                setDeleteModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleConfirmDelete = (surveyId: number) => {
        setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
        setDeleteModalOpen(false);
        setToDelete(null);
    };

    const getSurveyActions = (survey: any) => {
        const baseActions = [
            { key: 'share', label: 'Share Survey', icon: <FaShare className="w-4 h-4" />, destructive: false },
        ];

        // Add status-specific actions
        if (survey.status === 'Active') {
            baseActions.push(
                { key: 'pause', label: 'Pause Survey', icon: <FaPause className="w-4 h-4" />, destructive: false },
                { key: 'stop', label: 'Stop Survey', icon: <FaStop className="w-4 h-4" />, destructive: true }
            );
        } else if (survey.status === 'Draft') {
            baseActions.push(
                { key: 'resume', label: 'Activate Survey', icon: <FaPlay className="w-4 h-4" />, destructive: false }
            );
        } else if (survey.status === 'Pending') {
            baseActions.push(
                { key: 'resume', label: 'Resume Survey', icon: <FaPlay className="w-4 h-4" />, destructive: false }
            );
        }

        // Add analytics and export for completed/active surveys
        if (survey.status === 'Active' || survey.status === 'Completed') {
            baseActions.push(
                { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false },
                { key: 'export', label: 'Export Data', icon: <FaDownload className="w-4 h-4" />, destructive: false }
            );
        }

        baseActions.push(
            { key: 'delete', label: 'Delete Survey', icon: <FaTrash className="w-4 h-4" />, destructive: true }
        );

        return baseActions;
    };

    const renderTableView = () => (
        <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-visible">
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
                    {surveys.map((survey) => (
                        <tr key={survey.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700">{survey.name}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                                    {survey.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{survey.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 font-medium">{survey.projects}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-4">
                                    <button 
                                        onClick={() => handleSurveyAction('edit', survey.id, survey.name)}
                                        className="text-primary cursor-pointer hover:text-blue-700"
                                        title="Edit Survey"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleSurveyAction('view', survey.id, survey.name)}
                                        className="text-title cursor-pointer hover:text-shadow-title"
                                        title="View Survey"
                                    >
                                        <FaEye className="w-4 h-4" />
                                    </button>

                                    {/* ACTION Menu */}
                                    <CustomDropdown
                                        trigger={
                                            <button className="text-gray-400 cursor-pointer hover:text-gray-600 p-1">
                                                <FaEllipsisV className="w-4 h-4" />
                                            </button>
                                        }
                                        position="bottom-right"
                                        dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                                    >
                                        {getSurveyActions(survey).map((action) => (
                                            <DropdownItem
                                                key={action.key}
                                                icon={action.icon}
                                                destructive={action.destructive}
                                                onClick={() => handleSurveyAction(action.key, survey.id, survey.name)}
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
            {surveys.map((survey) => (
                <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-4">
                            {getInitials(survey.name)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-700 mb-1">{survey.name}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                                {survey.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-600">{survey.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{survey.questions} questions</span>
                            <span>{survey.time} to complete</span>
                        </div>
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">{survey.projects}</span> responses received
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">{survey.email}</span>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => handleSurveyAction('edit', survey.id, survey.name)}
                                className="text-primary hover:text-blue-700"
                                title="Edit Survey"
                            >
                                <FaEdit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleSurveyAction('delete', survey.id, survey.name)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Survey"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>
                            
                            {/* Dropdown Menu */}
                            <CustomDropdown
                                trigger={
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <FaEllipsisV className="w-4 h-4" />
                                    </button>
                                }
                                position="bottom-right"
                                dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                            >
                                {getSurveyActions(survey).map((action) => (
                                    <DropdownItem
                                        key={action.key}
                                        icon={action.icon}
                                        destructive={action.destructive}
                                        className='min-w-52'
                                        onClick={() => handleSurveyAction(action.key, survey.id, survey.name)}
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
            <Breadcrumb
                items={["Community", "Surveys"]}
                title="Surveys"
                className='absolute top-0 left-0 w-full px-6'
            />

            {/* Header with view controls */}
            <div className="pt-14">
                <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-600 mr-2">Survey List</h2>
                        <span className="text-gray-500 text-lg">({surveys.length})</span>
                    </div>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-3">
                        {/* View Toggle Buttons */}
                        <div className="flex items-center bg-white rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <FaList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                <FaTh className="w-4 h-4" />
                            </button>
                        </div>

                        <Link to="/dashboard/surveys/add-new" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2">
                            <span className="text-lg">+</span>
                            Create Survey
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? renderTableView() : renderGridView()}

            {/* Delete Confirmation Modal */}
            <DeleteSurveyModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setToDelete(null); }}
                surveyId={toDelete?.id}
                surveyTitle={toDelete?.name}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export const Route = createFileRoute('/dashboard/surveys/')({
    component: SurveyComponent,
})