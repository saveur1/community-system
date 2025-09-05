import { useState, useMemo } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
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
import Modal, { ModalFooter, ModalButton } from '@/components/ui/modal';
import { QRCodeCanvas } from 'qrcode.react';
import { FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { SurveysListParams } from '@/api/surveys';

const SurveyComponent = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
    // Share modal state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareSurvey, setShareSurvey] = useState<any | null>(null);
    const [isCopying, setIsCopying] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { user } = useAuth();

    const params = useMemo(() => {
        const param: SurveysListParams = { page, limit: pageSize, surveyType: "general", owner: "me" };

        if(checkPermissions(user, 'survey:view:all')) {
            param.owner = "any";
        }

        return param;
    }, [page, pageSize]);

    const { data, isLoading } = useSurveysList(params);
    const deleteSurvey = useDeleteSurvey();
    const updateStatus = useUpdateSurveyStatus();
    const router = useRouter();

    const surveys = useMemo(() => data?.result ?? [], [data]);

    const getStatusColor = (status: 'active' | 'paused' | 'archived') => {
        switch (status) {
            case 'active':
                return 'bg-green-300 text-green-900';
            case 'paused':
                return 'bg-yellow-300 text-yellow-900';
            case 'archived':
                return 'bg-gray-200 text-gray-900';
            default:
                return 'bg-gray-300 text-gray-900';
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
                router.navigate({ to: `/dashboard/surveys/analytics/${surveyId}` });
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

    const buildShareLink = (s: any) => {
        // link to the take page — this assumes route /dashboard/surveys/take/:id (adjust if different)
        return `${window.location.origin}/dashboard/surveys/take/${s.id}`;
    };

    const openShareModal = (s: any) => {
      setShareSurvey(s);
      setShareModalOpen(true);
    };

    const handleCopyLink = async (link: string) => {
      try {
        setIsCopying(true);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
        } else {
          // fallback
          const ta = document.createElement('textarea');
          ta.value = link;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        toast.success('Link copied to clipboard');
      } catch (e: any) {
        toast.error('Failed to copy link');
      } finally {
        setIsCopying(false);
      }
    };

    const handleActionClick = (actionKey: string, survey: any) => {
      if (actionKey === 'pause') updateStatus.mutate({ surveyId: String(survey.id), status: 'paused' });
      else if (actionKey === 'activate') updateStatus.mutate({ surveyId: String(survey.id), status: 'active' });
      else if (actionKey === 'archive') updateStatus.mutate({ surveyId: String(survey.id), status: 'archived' });
      else if (actionKey === 'share') openShareModal(survey);
      else if (actionKey === 'delete') { setToDelete({ id: survey.id, name: survey.title }); setDeleteModalOpen(true); }
      else handleSurveyAction(actionKey, survey.id, survey.title);
    };

    const getSurveyActions = (survey: any, user: User | null) => {
        const baseActions = [
            { key: 'share', label: 'Share Survey', icon: <FaShare className="w-4 h-4" />, destructive: false },
        ];

        // Add status-specific actions
        if (checkPermissions(user, 'survey:update')) {
            if (survey.status === 'active') {
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false },
                    { key: 'export', label: 'Export Data', icon: <FaDownload className="w-4 h-4" />, destructive: false },
                    { key: 'pause', label: 'Pause Survey', icon: <FaPause className="w-4 h-4" />, destructive: false },
                    { key: 'archive', label: 'Archive Survey', icon: <FaStop className="w-4 h-4" />, destructive: true },
                );
            } else if (survey.status === 'paused') {
                baseActions.push(
                    { key: 'activate', label: 'Activate Survey', icon: <FaPlay className="w-4 h-4" />, destructive: false },
                    { key: 'archive', label: 'Archive Survey', icon: <FaStop className="w-4 h-4" />, destructive: true },
                );
            } else if (survey.status === 'archived') {
                // Archived: analytics/export still allowed to view data if permitted
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false },
                    { key: 'export', label: 'Export Data', icon: <FaDownload className="w-4 h-4" />, destructive: false },
                );
            }
        }

        if (checkPermissions(user, 'survey:delete')) {
            baseActions.push(
                { key: 'delete', label: 'Delete Survey', icon: <FaTrash className="w-4 h-4" />, destructive: true }
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
                        ) : paginated.map((survey: any) => (
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
                                                    onClick={() => handleActionClick(action.key, survey)}
                                                    className='min-w-52'
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
                                        onClick={() => handleActionClick(action.key, survey)}
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

    // Share modal (placed near bottom)
    const shareLink = shareSurvey ? buildShareLink(shareSurvey) : '';

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
                    title="Surveys"
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

            {/* Share Survey Modal */}
            <Modal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Survey" size="lg" closeOnOverlayClick>
              <div className="p-4">
                <div className="flex gap-6">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{shareSurvey?.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">Share the survey link or scan the QR code to allow respondents to open the survey on their device.</p>

                    <label className="block text-sm font-medium text-gray-700 mb-2">Shareable link</label>
                    <div className="flex items-center gap-2">
                      <input readOnly value={shareLink} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50" />
                      <button onClick={() => handleCopyLink(shareLink)} className="px-3 py-2 bg-primary text-white rounded-md flex items-center gap-2">
                        <FiCopy />
                        {isCopying ? 'Copying' : 'Copy'}
                      </button>
                    </div>

                    {/* Allowed roles (view-only badges) */}
                    {shareSurvey?.allowedRoles && (shareSurvey.allowedRoles.length > 0) && (
                      <div className="mt-4 border border-gray-200 p-3 rounded-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Allowed roles</label>
                        <div className="flex flex-wrap gap-2">
                          {shareSurvey.allowedRoles.map((r: any) => {
                            const label = (r.name || r.displayName || '').toString().split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            return (
                              <span key={r.id} className="inline-flex items-center bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                                {label || r.id}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <a href={`mailto:?subject=${encodeURIComponent('Please take this survey')}&body=${encodeURIComponent(shareLink)}`} className="text-sm text-primary hover:underline">Share via Email</a>
                      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Please take this survey')}&url=${encodeURIComponent(shareLink)}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Share on Twitter</a>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <p>Tip: You can paste this link into chat, email or copy it to your clipboard. The QR code on the right can be scanned by mobile users.</p>
                    </div>
                  </div>

                  <div className="w-48 flex-shrink-0 flex flex-col items-center justify-center border-l border-gray-100 pl-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      {shareLink ? <QRCodeCanvas value={shareLink} size={160} /> : <div className="w-40 h-40 bg-gray-100" />}
                    </div>
                    <div className="text-xs text-gray-500 mt-3 text-center">Scan to open survey</div>
                  </div>
                </div>
              </div>
              <ModalFooter>
                <ModalButton onClick={() => setShareModalOpen(false)} variant="secondary">Close</ModalButton>
                <ModalButton onClick={() => { handleCopyLink(shareLink); }} variant="primary">Copy link</ModalButton>
              </ModalFooter>
            </Modal>
        </div>
    );
};

export const Route = createFileRoute('/dashboard/surveys/')({
    component: SurveyComponent,
})