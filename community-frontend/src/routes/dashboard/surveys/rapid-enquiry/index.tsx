import { useMemo, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { FaShare, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useSurveysList } from '@/hooks/useSurveys';
import { useDeleteSurvey, useUpdateSurveyStatus } from '@/hooks/useSurveys';
import type { SurveysListParams } from '@/api/surveys';
import { toast } from 'react-toastify';
import useAuth from '@/hooks/useAuth';
import type { User } from '@/api/auth';
import { checkPermissions } from '@/utility/logicFunctions';
import SurveyShareModal from '@/components/features/surveys/SurveyShareModal';
import ExportSurveyModal from '@/components/features/surveys/details/export-survey-modal';
import RapidEnquiryTable from '@/components/features/surveys/rapid-enquiry/RapidEnquiryTable';
import { SelectDropdown } from '@/components/ui/select';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export const Route = createFileRoute('/dashboard/surveys/rapid-enquiry/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'paused' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareSurvey, setShareSurvey] = useState<any | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  // Export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const [exportSurvey, setExportSurvey] = useState<any | null>(null);
  const { isOnline } = useNetworkStatus();

  const params = useMemo(() => {
    const p: SurveysListParams = { page, limit: pageSize, surveyType: 'rapid-enquiry', search: query };
    // map status filter if applied
    if (statusFilter !== 'all') p.status = statusFilter;
    return p;
  }, [page, pageSize, statusFilter, query]);

  const { data, isLoading } = useSurveysList(params);
  const deleteSurvey = useDeleteSurvey();
  const updateStatus = useUpdateSurveyStatus();

  const list = useMemo(() => data?.result ?? [], [data]);
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  const getStatusColor = (status: 'active' | 'paused' | 'archived' | string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getSurveyActions = (survey: any, u: User | null) => {
    const baseActions: any[] = [
      { key: 'share', label: 'Share Survey', icon: <FaShare className="w-4 h-4" />, destructive: false },
    ];

    if (checkPermissions(u, 'survey:update')) {
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
              { key: 'export-pdf', label: 'Export to PDF', icon: <FaFilePdf className="text-red-600" /> },
            ],
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
              { key: 'export-pdf', label: 'Export to PDF', icon: <FaFilePdf className="text-red-600" /> },
            ],
          } as any,
        );
      }
    }

    if (checkPermissions(u, 'survey:delete')) {
      baseActions.push({ key: 'delete', label: 'Delete Survey', icon: <FaTrash className="w-4 h-4" />, destructive: true });
    }

    return baseActions;
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

  const handleExportClick = (type: 'excel' | 'pdf', surveyId: string) => {
    const survey = list.find((s: any) => s.id === surveyId);
    setExportType(type);
    setExportSurvey(survey);
    setExportModalOpen(true);
  };

  const handleActionClick = (actionKey: string, survey: any) => {
    if (actionKey === 'pause') updateStatus.mutate({ surveyId: String(survey.id), status: 'paused' });
    else if (actionKey === 'activate') updateStatus.mutate({ surveyId: String(survey.id), status: 'active' });
    else if (actionKey === 'archive') updateStatus.mutate({ surveyId: String(survey.id), status: 'archived' });
    else if (actionKey === 'share') openShareModal(survey);
    else if (actionKey === 'delete') { setDeleteId(String(survey.id)); setConfirmOpen(true); }
    else if (actionKey === 'export-excel') handleExportClick('excel', survey.id);
    else if (actionKey === 'export-pdf') handleExportClick('pdf', survey.id);
    else if (actionKey === 'analytics') navigate({ to: `/dashboard/surveys/${survey.id}/analytics` });
    else if (actionKey === 'view') alert(`Viewing details for: ${survey.title}`);
    else if (actionKey === 'edit') alert(`Editing survey: ${survey.title}`);
    else if (actionKey === 'duplicate') alert(`Duplicating survey: ${survey.title}`);
    else if (actionKey === 'pause') alert(`Pausing survey: ${survey.title}`);
    else if (actionKey === 'resume') alert(`Resuming survey: ${survey.title}`);
    else if (actionKey === 'stop') alert(`Stopping survey: ${survey.title}`);
  };

  const handleDelete = async (id?: string) => {
    const toDelete = id ?? deleteId;
    if (!toDelete) return;
    deleteSurvey.mutate(toDelete, {
      onSuccess: () => {
        toast.success('Rapid enquiry deleted');
      },
    });
    setDeleteId(null);
    setConfirmOpen(false);
  };

  // Show offline indicator when not online
  if (!isOnline) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumb items={['Dashboard', 'Rapid Enquiry']} title="Rapid Enquiry" className="absolute top-0 left-0 w-full px-6 bg-white dark:bg-gray-900" />
        <div className="pt-20">
          <OfflineIndicator 
            title="Rapid Enquiry Not Available Offline"
            message="The rapid enquiry page requires an internet connection to load and manage enquiry data. Please check your connection and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb items={['Dashboard', 'Rapid Enquiry']} title="Rapid Enquiry" className="absolute top-0 left-0 w-full px-6 bg-white dark:bg-gray-900" />

      <div className="pt-20">
        <div className="bg-white dark:bg-gray-800 border rounded-lg border-gray-300 dark:border-gray-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value) }}
                placeholder="Search rapid enquiries..."
                className="w-full pl-10 pr-4 py-2 border outline-none focus:ring-2 focus:ring-primary border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>

            <SelectDropdown
              value={statusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "paused", label: "Paused" },
                { value: "archived", label: "Archived" },
              ]}
              onChange={(value) => { setStatusFilter(value as any); setPage(1); }}
              dropdownClassName="min-w-32"
            />
          </div>

          <Link to="/dashboard/surveys/rapid-enquiry/add-new" className="ml-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg flex items-center transition-colors">
            <FiPlus className="mr-2" /> New Rapid Enquiry
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Rapid Enquiry History</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <RapidEnquiryTable
            surveys={list}
            isLoading={isLoading}
            onActionClick={handleActionClick}
            getStatusColor={getStatusColor}
            getSurveyActions={getSurveyActions}
            user={user}
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Showing {list.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage <= 1} 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-gray-900 dark:text-gray-100">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage >= totalPages} 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Next
            </button>
            <div className="flex items-center ml-2">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Show:</span>
              <select 
                value={pageSize} 
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} 
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {[5, 10, 20, 50].map(n => 
                  <option key={n} value={n}>
                    {n}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Rapid Enquiry" size="sm">
        <ModalBody>
          <p className="text-sm text-gray-700 dark:text-gray-300">Are you sure you want to delete this rapid enquiry? This cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</ModalButton>
          <ModalButton variant="danger" onClick={() => handleDelete()}>Delete</ModalButton>
        </ModalFooter>
      </Modal>

      {/* Share Survey Modal */}
      <SurveyShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        survey={shareSurvey}
        shareLink={shareSurvey ? `${window.location.origin}/answers/${shareSurvey.id}` : ''}
        isCopying={isCopying}
        onCopy={handleCopyLink}
      />

      {/* Export Survey Modal */}
      <ExportSurveyModal
        isOpen={exportModalOpen}
        onClose={() => { setExportModalOpen(false); setExportSurvey(null); }}
        exportType={exportType}
        surveyTitle={exportSurvey?.title || ''}
        survey={exportSurvey}
      />
    </div>
  );
}
