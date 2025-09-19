import { useState, useMemo } from 'react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaShare, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaPlus, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import DeleteSurveyModal from '@/components/features/surveys/delete-survey-modal';
import MainToolbar from '@/components/common/main-toolbar';
import { SurveyPagination } from '@/components/features/surveys/survey-pagination';
import useAuth from '@/hooks/useAuth';
import type { User } from '@/api/auth';
import { useSurveysList, useDeleteSurvey, useUpdateSurveyStatus } from '@/hooks/useSurveys';
import { checkPermissions, spacer } from '@/utility/logicFunctions';
import { toast } from 'react-toastify';
import type { SurveysListParams, SurveyEntity } from '@/api/surveys';
import SurveyListTable from '@/components/features/surveys/SurveyListTable';
import SurveyGridCard from '@/components/features/surveys/SurveyGridCard';
import SurveyShareModal from '@/components/features/surveys/SurveyShareModal';
import ExportSurveyModal from '@/components/features/surveys/details/export-survey-modal';
import { format, parseISO } from 'date-fns';

const SurveyComponent = () => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);
    // Share modal state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareSurvey, setShareSurvey] = useState<any | null>(null);
    const [isCopying, setIsCopying] = useState(false);
    // Export modal state
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
    const [exportSurvey, setExportSurvey] = useState<any | null>(null);
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

    // Build rows for Excel export (similar to feedback page approach)
    const excelDataExported = (list: SurveyEntity[]) => {
      return (list || []).map((s, idx) => ({
        id: idx + 1,
        title: s.title,
        project: s.project,
        surveyType: spacer(s.surveyType ?? ''),
        estimatedTime: s.estimatedTime ?? '',
        status: s.status,
        organization: s.organization?.name ?? '',
        creator: s.creator?.name ?? '',
        startAt: s.startAt ? format(parseISO(s.startAt), 'MMM dd, yyyy h:mm a') : '',
        endAt: s.endAt ? format(parseISO(s.endAt), 'MMM dd, yyyy h:mm a') : '',
        questionsCount: s.questionItems?.length ?? s.questions?.length ?? 0,
        responsesCount: s.responses?.length ?? 0,
        allowedRoles: (s.allowedRoles || []).map(r => spacer(r.name ?? '')).join(', '),
        createdAt: s.createdAt ? format(parseISO(s.createdAt), 'MMM dd, yyyy h:mm a') : '',
        updatedAt: s.updatedAt ? format(parseISO(s.updatedAt), 'MMM dd, yyyy h:mm a') : '',
      }));
    };

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
                router.navigate({ to: `/dashboard/surveys/${surveyId}/analytics` });
                break;
            case 'export':
                // This will be handled by the dropdown now
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
        // link to the take page — this assumes route /answers/:id
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
      else if (actionKey === 'export-excel') handleExportClick('excel', survey.id);
      else if (actionKey === 'export-pdf') handleExportClick('pdf', survey.id);
      else handleSurveyAction(actionKey, survey.id, survey.title);
    };

    const handleExportClick = (type: 'excel' | 'pdf', surveyId: string) => {
      const survey = surveys.find(s => s.id === surveyId);
      setExportType(type);
      setExportSurvey(survey);
      setExportModalOpen(true);
    };

    const handleExportModalClose = () => {
      setExportModalOpen(false);
      setExportSurvey(null);
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
                { key: 'delete', label: 'Delete Survey', icon: <FaTrash className="w-4 h-4" />, destructive: true }
            );
        }

        return baseActions;
    };

    const renderTableView = () => (
        <SurveyListTable
          paginated={paginated}
          isLoading={isLoading}
          getStatusColor={getStatusColor}
          getSurveyActions={getSurveyActions}
          user={user}
          handleActionClick={handleActionClick}
        />
    );

    const renderGridView = () => (
        <SurveyGridCard
          paginated={paginated}
          isLoading={isLoading}
          getInitials={getInitials}
          getStatusColor={getStatusColor}
          getSurveyActions={getSurveyActions}
          user={user}
          handleActionClick={(key: string, survey: any) => {
            if (key === 'delete') { setToDelete({ id: survey.id, name: survey.title }); setDeleteModalOpen(true); }
            else handleActionClick(key, survey);
          }}
        />
    );

    // Share modal (placed near bottom)
    const shareLink = shareSurvey ? buildShareLink(shareSurvey) : '';

    return (
        <div className="pb-10">
            <Breadcrumb
                items={[
                    {title:"Dashboard", link:"/dashboard"}, 
                    "Surveys"
                ]}
                title="Surveys"
                className='absolute top-0 left-0 w-full px-6'
            />

            {/* Header with view controls */}
            <div className="pt-14">
                {/* Survey Toolbar */}
                <MainToolbar
                    title="Surveys"
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    search={search}
                    setSearch={setSearch}
                    filteredCount={filtered.length}
                    showCreate={true}
                    createButton={{ to: '/dashboard/surveys/add-new', label: 'New Survey', icon: <FaPlus /> }}
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
                    excelFileName='surveys'
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
              shareLink={shareLink}
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

export const Route = createFileRoute('/dashboard/surveys/')({
    component: SurveyComponent,
})