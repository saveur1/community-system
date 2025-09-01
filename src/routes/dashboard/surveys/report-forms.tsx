import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaEye, FaShare, FaEdit, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaList, FaTh, FaEllipsisV } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import DeleteSurveyModal from '@/components/features/surveys/delete-survey-modal';
import { SurveyToolbar } from '@/components/features/surveys/survey-toolbar';
import { SurveyPagination } from '@/components/features/surveys/survey-pagination';
import useAuth from '@/hooks/useAuth';
import { User } from '@/api/auth';
import { useSurveysList, useDeleteSurvey, useUpdateSurveyStatus } from '@/hooks/useSurveys';
import { checkPermissions } from '@/utility/logicFunctions';

const SurveyReportForms = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { user } = useAuth();
    const { data, isLoading } = useSurveysList({ page, limit: pageSize });
    const deleteSurvey = useDeleteSurvey();
    const updateStatus = useUpdateSurveyStatus();

    const surveys = useMemo(() => data?.result ?? [], [data]);

    const getStatusColor = (status: 'active' | 'paused' | 'archived') => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'paused':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-200 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleSurveyAction = (action: string, surveyId: string, surveyName: string) => {
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
        return surveys.filter((survey: any) =>
            [survey.title, survey.project, survey.description].some((v: any) =>
                String(v ?? '').toLowerCase().includes(q)
            )
        );
    }, [surveys, search]);

    const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered; // server-paginated; filter client-side only

    const handleConfirmDelete = () => {
        if (toDelete?.id) {
            deleteSurvey.mutate(toDelete.id);
        }
        setDeleteModalOpen(false);
        setToDelete(null);
    };

    const getSurveyActions = (survey: any, user: User | null) => {
        const baseActions = [
            { key: 'share', label: 'Share Survey', icon: <FaShare className='w-4 h-4' />, destructive: false },
        ];

        // Add status-specific actions
        if (checkPermissions(user, 'survey:update')) {
            if (survey.status === 'active') {
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className='w-4 h-4' />, destructive: false },
                    { key: 'export', label: 'Export Data', icon: <FaDownload className='w-4 h-4' />, destructive: false },
                    { key: 'pause', label: 'Pause Survey', icon: <FaPause className='w-4 h-4' />, destructive: false },
                    { key: 'archive', label: 'Archive Survey', icon: <FaStop className='w-4 h-4' />, destructive: true },
                );
            } else if (survey.status === 'paused') {
                baseActions.push(
                    { key: 'activate', label: 'Activate Survey', icon: <FaPlay className='w-4 h-4' />, destructive: false },
                    { key: 'archive', label: 'Archive Survey', icon: <FaStop className='w-4 h-4' />, destructive: true },
                );
            } else if (survey.status === 'archived') {
                // Archived: analytics/export still allowed to view data if permitted
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className='w-4 h-4' />, destructive: false },
                    { key: 'export', label: 'Export Data', icon: <FaDownload className='w-4 h-4' />, destructive: false },
                );
            }
        }

        if (checkPermissions(user, 'survey:delete')) {
            baseActions.push(
                { key: 'delete', label: 'Delete Survey', icon: <FaTrash className='w-4 h-4' />, destructive: true }
            );
        }

        return baseActions;
    };

    const renderTableView = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-visible">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Survey Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responses</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td className="px-6 py-4 text-sm text-gray-500" colSpan={7}>Loading surveys...</td>
                            </tr>
                        ) : paginated?.map((survey: any) => (
                            <tr key={survey.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">{survey.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                                        {survey.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{(survey.answers?.length) ?? 0}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.questionItems?.length ?? 0}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.estimatedTime}Min</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{survey.project}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to="/dashboard/surveys/edit/$edit-id"
                                            params={{ 'edit-id': String(survey.id) }}
                                            className="text-primary cursor-pointer hover:text-blue-700"
                                            title="Edit Survey"
                                        >
                                            <FaEdit className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            to="/dashboard/surveys/$view-id"
                                            params={{ 'view-id': String(survey.id) }}
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
                                                    onClick={() => {
                                                        if (action.key === 'pause') updateStatus.mutate({ surveyId: String(survey.id), status: 'paused' });
                                                        else if (action.key === 'activate') updateStatus.mutate({ surveyId: String(survey.id), status: 'active' });
                                                        else if (action.key === 'archive') updateStatus.mutate({ surveyId: String(survey.id), status: 'archived' });
                                                        else handleSurveyAction(action.key, survey.id, survey.title);
                                                    }}
                                                >
                                                    {action.label}
                                                </DropdownItem>
                                            ))}
                                        </CustomDropdown>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {paginated?.length === 0 && (
                            <tr>
                                <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={7}>No report forms found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
                <div className="col-span-full text-sm text-gray-500">Loading surveys...</div>
            ) : paginated.map((survey: any) => (
                <div key={survey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-4">
                            {getInitials(survey.title)}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-700 mb-1">{survey.title}</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey.status)}`}>
                                {survey.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <p className="text-sm text-gray-600">{survey.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>{survey.questionItems?.length ?? 0} questions</span>
                            <span>{survey.estimatedTime}Min to complete</span>
                        </div>
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">{(survey.answers?.length) ?? 0}</span> responses received
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-sm text-gray-500">{survey.project}</span>
                        <div className="flex items-center space-x-2">
                            <Link
                                to="/dashboard/surveys/edit/$edit-id"
                                params={{ 'edit-id': String(survey.id) }}
                                className="text-primary hover:text-blue-700"
                                title="Edit Survey"
                            >
                                <FaEdit className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => handleSurveyAction('delete', survey.id, survey.title)}
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
                                        onClick={() => handleSurveyAction(action.key, survey.id, survey.title)}
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
                items={["Dashboard", "Report forms"]}
                title="Report Forms"
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
                    title="Report Forms"
                />
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? renderTableView() : renderGridView()}

            {/* Survey Pagination */}
            <SurveyPagination
                currentPage={currentPage}
                totalPages={totalPages}
                paginatedCount={paginated.length}
                filteredCount={data?.meta?.total ?? filtered.length}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
            />

            {/* Delete Confirmation Modal */}
            <DeleteSurveyModal
                isOpen={deleteModalOpen}
                onClose={() => { setDeleteModalOpen(false); setToDelete(null); }}
                surveyId={toDelete?.id as any}
                surveyTitle={toDelete?.name}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export const Route = createFileRoute('/dashboard/surveys/report-forms')({
    component: SurveyReportForms,
})