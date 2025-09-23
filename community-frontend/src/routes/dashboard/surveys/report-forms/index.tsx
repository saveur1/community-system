import { useState, useMemo } from 'react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaEye, FaEdit, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaEllipsisV, FaPlus, FaFileExcel, FaFilePdf, FaShare, FaChevronRight } from 'react-icons/fa';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import DeleteSurveyModal from '@/components/features/surveys/delete-survey-modal';
import MainToolbar from '@/components/common/main-toolbar';
import { SurveyPagination } from '@/components/features/surveys/survey-pagination';
import useAuth from '@/hooks/useAuth';
import type { User } from '@/api/auth';
import { useSurveysList } from '@/hooks/useSurveys';
import { useDeleteSurvey, useUpdateSurveyStatus } from '@/hooks/useSurveys';
import { checkPermissions } from '@/utility/logicFunctions';
import { format, parseISO } from 'date-fns';
import ExportSurveyModal from '@/components/features/surveys/details/export-survey-modal';
import SurveyShareModal from '@/components/features/surveys/SurveyShareModal';
import { toast } from 'react-toastify';

const SurveyReportForms = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { user } = useAuth();
    const { data, isLoading } = useSurveysList({ page, limit: pageSize, surveyType: "report-form" });
    const deleteSurvey = useDeleteSurvey();
    const updateStatus = useUpdateSurveyStatus();
    const router = useRouter();
    // Export modal state
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
    const [exportSurvey, setExportSurvey] = useState<any | null>(null);
    // Share modal state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareSurvey, setShareSurvey] = useState<any | null>(null);
    const [isCopying, setIsCopying] = useState(false);

    const surveys = useMemo(() => data?.result ?? [], [data]);

    // Build rows for Excel export (similar to surveys page approach)
    const excelDataExported = (list: any[]) => {
        return (list || []).map((s, idx) => ({
            id: idx + 1,
            title: s.title,
            project: s.project,
            surveyType: s.surveyType ?? 'report-form',
            estimatedTime: s.estimatedTime ?? '',
            status: s.status,
            organization: s.organization?.name ?? '',
            creator: s.creator?.name ?? '',
            startAt: s.startAt ? format(parseISO(s.startAt), 'MMM dd, yyyy h:mm a') : '',
            endAt: s.endAt ? format(parseISO(s.endAt), 'MMM dd, yyyy h:mm a') : '',
            questionsCount: s.questionItems?.length ?? s.questions?.length ?? 0,
            responsesCount: s.responses?.length ?? 0,
            allowedRoles: (s.allowedRoles || []).map((r: any) => r.name).join(', '),
            createdAt: s.createdAt ? format(parseISO(s.createdAt), 'MMM dd, yyyy h:mm a') : '',
            updatedAt: s.updatedAt ? format(parseISO(s.updatedAt), 'MMM dd, yyyy h:mm a') : '',
        }));
    };

    const getStatusColor = (status: 'active' | 'paused' | 'archived' | 'draft') => {
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
                break;;
            case 'share':
                {
                  const survey = surveys.find((s: any) => s.id === surveyId);
                  openShareModal(survey);
                }
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
                router.navigate({ to: `/dashboard/surveys/${surveyId}/analytics` });
                break;
            case 'export':
                // handled by submenu actions below
                break;
            case 'export-excel':
                handleExportClick('excel', surveyId);
                break;
            case 'export-pdf':
                handleExportClick('pdf', surveyId);
                break;
            case 'delete':
                setToDelete({ id: surveyId, name: surveyName });
                setDeleteModalOpen(true);
                break;
            default:
                break;
        }
    };

    const handleActionClick = (actionKey: string, survey: any) => {
        if (actionKey === 'pause') updateStatus.mutate({ surveyId: String(survey.id), status: 'paused' });
        else if (actionKey === 'activate') updateStatus.mutate({ surveyId: String(survey.id), status: 'active' });
        else if (actionKey === 'archive') updateStatus.mutate({ surveyId: String(survey.id), status: 'archived' });
        else if (actionKey === 'delete') { setToDelete({ id: survey.id, name: survey.title }); setDeleteModalOpen(true); }
        else if (actionKey === 'share') { openShareModal(survey); }
        else handleSurveyAction(actionKey, survey.id, survey.title);
    };

    const handleExportClick = (type: 'excel' | 'pdf', surveyId: string) => {
      const survey = surveys.find((s: any) => s.id === surveyId);
      setExportType(type);
      setExportSurvey(survey);
      setExportModalOpen(true);
    };

    const handleExportModalClose = () => {
      setExportModalOpen(false);
      setExportSurvey(null);
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
        const baseActions: any[] = [
          { key: 'share', label: 'Share Survey', icon: <FaShare className="w-4 h-4" />, destructive: false },
        ];

        // Add status-specific actions
        if (checkPermissions(user, 'survey:update')) {
            if (survey.status === 'active') {
                baseActions.push(
                    { key: 'analytics', label: 'View Analytics', icon: <FaChartBar className='w-4 h-4' />, destructive: false },
                    { 
                      key: 'export', 
                      label: 'Export Data', 
                      icon: <FaDownload className="w-4 h-4" />, 
                      destructive: false,
                      hasSubmenu: true,
                      submenu: [
                        { key: 'export-excel', label: 'Export to Excel', icon: <FaFileExcel className="text-green-600" /> },
                        { key: 'export-pdf', label: 'Export to PDF', icon: <FaFilePdf className="text-red-600" /> }
                      ]
                    } as any,
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
                    { 
                      key: 'export', 
                      label: 'Export Data', 
                      icon: <FaDownload className="w-4 h-4" />, 
                      destructive: false,
                      hasSubmenu: true,
                      submenu: [
                        { key: 'export-excel', label: 'Export to Excel', icon: <FaFileExcel className="text-green-600" /> },
                        { key: 'export-pdf', label: 'Export to PDF', icon: <FaFilePdf className="text-red-600" /> }
                      ]
                    } as any,
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

    const buildShareLink = (s: any) => {
        return `${window.location.origin}/answers/${s.id}`;
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

    const renderTableView = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm">Survey Title</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">Status</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm">Target User</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">Questions</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">Time</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">Project</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6 sm:py-3 sm:text-sm">Actions</th>
                    </tr>
                </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td className="px-3 py-2 text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm" colSpan={7}>Loading surveys...</td>
                            </tr>
                        ) : paginated?.map((survey) => (
                            <tr key={survey.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 sm:px-6 sm:py-4">
                                    <div className="flex items-center">
                                        <div>
                                            <div className="text-xs font-medium text-gray-700 sm:text-sm">{survey.title}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4 max-sm:hidden">
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(survey.status)}`}>
                                        {survey.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm flex gap-1 sm:gap-2">{
                                        survey?.allowedRoles?.slice(0, 4).map((role, index) => 
                                            <p key={index} className="bg-gray-300 capitalize text-gray-800 rounded-lg p-1 text-xs">{role.name}</p>
                                )}</td>
                                <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">{survey.questionItems?.length ?? 0}</td>
                                <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">{survey.estimatedTime}Min</td>
                                <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">{survey.project}</td>
                                <td className="px-3 py-2 sm:px-6 sm:py-4">
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
                                            to="/dashboard/surveys/report-forms/$report-id"
                                            params={{ 'report-id': String(survey.id) }}
                                            className="text-title cursor-pointer hover:text-shadow-title"
                                            title="View Survey"
                                        >
                                            <FaEye className="w-4 h-4" />
                                        </Link>

                                        {/* ACTION Menu with submenu support */}
                                        <CustomDropdown
                                            trigger={
                                                <button className="text-gray-400 cursor-pointer hover:text-gray-600 p-1">
                                                    <FaEllipsisV className="w-4 h-4" />
                                                </button>
                                            }
                                            position="bottom-right"
                                            portal={true}
                                            dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-50 overflow-visible"
                                        >
                                            {getSurveyActions(survey, user).map((action) => (
                                              action.hasSubmenu ? (
                                                <div key={action.key} className="relative group">
                                                  <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                      {action.icon}
                                                      <span>{action.label}</span>
                                                    </div>
                                                    <FaChevronRight className="w-3 h-3 text-gray-400" />
                                                  </div>
                                                  <div className="absolute right-full top-0 ml-1 hidden group-hover:block z-50">
                                                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40">
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
                                </td>
                            </tr>
                        ))}

                        {paginated?.length === 0 && (
                            <tr>
                                <td className="px-3 py-2 text-center text-xs text-gray-500 sm:px-6 sm:py-4 sm:text-sm" colSpan={7}>No report forms found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
                                onClick={() => handleActionClick('delete', survey)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Survey"
                            >
                                <FaTrash className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu with submenu support */}
                            <CustomDropdown
                                trigger={
                                    <button className="text-gray-400 hover:text-gray-600 p-1">
                                        <FaEllipsisV className="w-4 h-4" />
                                    </button>
                                }
                                position="bottom-right"
                                portal={true}
                                dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-50 overflow-visible"
                            >
                                {getSurveyActions(survey, user).map((action) => (
                                  action.hasSubmenu ? (
                                    <div key={action.key} className="relative group">
                                      <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                          {action.icon}
                                          <span>{action.label}</span>
                                        </div>
                                        <FaChevronRight className="w-3 h-3 text-gray-400" />
                                      </div>
                                      <div className="absolute right-full top-0 ml-1 hidden group-hover:block z-50">
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40">
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
                                      className='min-w-52'
                                      onClick={() => handleActionClick(action.key, survey)}
                                    >
                                      {action.label}
                                    </DropdownItem>
                                  )
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
                {/* Main Toolbar */}
                <MainToolbar
                    title="Report Forms"
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    search={search}
                    setSearch={(value) => { setSearch(value); setPage(1); }}
                    filteredCount={filtered.length}
                    showCreate={true}
                    createButton={{ to: '/dashboard/surveys/add-new?type=report', label: 'New Report Form', icon: <FaPlus /> }}
                    excelData={excelDataExported(surveys)}
                    excelColumnWidths={{
                        id: 6,
                        title: 40,
                        project: 24,
                        surveyType: 16,
                        estimatedTime: 18,
                        status: 14,
                        organization: 28,
                        creator: 22,
                        startAt: 22,
                        endAt: 22,
                        questionsCount: 18,
                        responsesCount: 18,
                        allowedRoles: 28,
                        createdAt: 22,
                        updatedAt: 22,
                    }}
                    excelFileName='report-forms'
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
            <SurveyShareModal
              isOpen={shareModalOpen}
              onClose={() => setShareModalOpen(false)}
              survey={shareSurvey}
              shareLink={shareSurvey ? buildShareLink(shareSurvey) : ''}
              isCopying={isCopying}
              onCopy={handleCopyLink}
            />

            {/* Export Survey Modal */}
            <ExportSurveyModal
              isOpen={exportModalOpen}
              onClose={handleExportModalClose}
              exportType={exportType}
              surveyTitle={exportSurvey?.title || ''}
              survey={exportSurvey}
            />
        </div>
    );
};

export const Route = createFileRoute('/dashboard/surveys/report-forms/')({
    component: SurveyReportForms,
})