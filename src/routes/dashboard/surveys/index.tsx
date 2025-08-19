import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaEye, FaShare, FaEdit, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaList, FaTh, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import DeleteSurveyModal from '@/components/pages/surveys/delete-survey-modal';
import { SurveyToolbar } from '@/components/pages/surveys/survey-toolbar';
import { SurveyPagination } from '@/components/pages/surveys/survey-pagination';
import useAuth from '@/hooks/useAuth';
import { User } from '@/api/auth';

const SurveyComponent = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { user } = useAuth();

    // Sample data for surveys
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

    // Search and pagination logic
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return surveys;
        return surveys.filter((survey) =>
            [survey.name, survey.email, survey.status, survey.projects.toString()].some((v) =>
                String(v).toLowerCase().includes(q)
            )
        );
    }, [surveys, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    const handleConfirmDelete = () => {
        if (toDelete) {
            setSurveys(surveys.filter(survey => survey.id !== toDelete.id));
        }
        setDeleteModalOpen(false);
        setToDelete(null);
    };

    const getSurveyActions = (survey: any, user: User | null) => {
        const baseActions = [
            { key: 'share', label: 'Share Survey', icon: <FaShare className="w-4 h-4" />, destructive: false },
        ];

        // Add status-specific actions
        if (user?.roles[0]?.permissions?.some((perm: any) => perm.name?.includes('survey:update'))) {
            if (survey.status === 'Active') {
                baseActions.push(
                    { key: 'pause', label: 'Pause Survey', icon: <FaPause className="w-4 h-4" />, destructive: false },
                    { key: 'stop', label: 'Stop Survey', icon: <FaStop className="w-4 h-4" />, destructive: true }
                );
            } else if (survey.status === 'Draft') {
                baseActions.push(
                    { key: 'activate', label: 'Activate Survey', icon: <FaPlay className="w-4 h-4" />, destructive: false }
                );
            } else if (survey.status === 'Pending') {
                baseActions.push(
                    { key: 'resume', label: 'Resume Survey', icon: <FaPlay className="w-4 h-4" />, destructive: false }
                );
            }
        }

        // Add analytics and export for completed/active surveys
        if (user?.roles[0]?.permissions?.some((perm: any) => perm.name === 'survey:analytics')) {
            if (survey.status === 'Active' || survey.status === 'Completed') {
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false },
                    { key: 'export', label: 'Export Data', icon: <FaDownload className="w-4 h-4" />, destructive: false, }
                );
            }
        }

        if (user?.roles[0]?.permissions?.some((perm: any) => perm.name === 'survey:delete')) {
            baseActions.push(
                { key: 'delete', label: 'Delete Survey', icon: <FaTrash className="w-4 h-4" />, destructive: true }
            );
        }

        return baseActions;
    };

    const renderTableView = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginated.map((survey) => (
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
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.projects}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.questions}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.time}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.email}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleSurveyAction('edit', survey.id, survey.name)}
                                            className="text-primary cursor-pointer hover:text-blue-700"
                                            title="Edit Survey"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </button>
                                        <Link
                                            to="/dashboard/surveys/$view-id"
                                            params={{ 'view-id': survey.id.toString() }}
                                            className="text-title cursor-pointer hover:text-shadow-title"
                                            title="View Survey"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </Link>

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
                                            {getSurveyActions(survey, user).map((action) => (
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
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((survey) => (
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
                                {getSurveyActions(survey, user).map((action) => (
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
                {/* Survey Toolbar */}
                <SurveyToolbar
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    search={search}
                    setSearch={setSearch}
                    filteredCount={filtered.length}
                />
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? renderTableView() : renderGridView()}

            {/* Survey Pagination */}
            <SurveyPagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginatedCount={paginated.length}
                filteredCount={filtered.length}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
            />

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