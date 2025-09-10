import { useMemo, useState } from 'react';
import { useGetFeedback, useDeleteFeedback, useUpdateFeedback } from '@/hooks/useFeedback';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaEye, FaTrash, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';
import DeleteFeedbackModal from '@/components/features/feedbacks/delete-feedback-modal';
import { FeedbackAction } from '@/utility/types';
import { FeedbackTable } from '@/components/features/feedbacks/feedbacks-table';
import { FeedbackGrid } from '@/components/features/feedbacks/feedbacks-grid-view';
import MainToolbar from '@/components/common/main-toolbar';
import { FeedbackPagination } from '@/components/features/feedbacks/feedback-pagination';
import { FeedbackDetailsDrawer } from '@/components/features/feedbacks/feedback-details-drawer';
import { FeedbackEntity, FeedbackListParams } from '@/api/feedback';
import { checkPermissions } from '@/utility/logicFunctions';
import { useAuth } from '@/hooks/useAuth';

const FeedbacksPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackEntity | undefined>(undefined);
  const { user } = useAuth();

  const feedbackParams = useMemo(() => {
    const param: FeedbackListParams = { page, limit: pageSize, search: search || undefined, owner: 'me' };

    if (checkPermissions(user, 'feedback:all:read')) {
      param.owner = undefined;
    }

    return param;
  }, [page, pageSize]);

  const { data, isLoading } = useGetFeedback(feedbackParams);
  const deleteFeedback = useDeleteFeedback();
  const updateFeedback = useUpdateFeedback();

  const feedbacks = data?.result ?? [];
  const meta = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-green-100 text-green-800 border border-green-200';
      case 'Acknowledged': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getInitials = (text: string) => text?.split(' ')?.map((n) => n[0])?.join('')?.toUpperCase();

  const handleAction = (action: string, fb: FeedbackEntity) => {
    switch (action) {
      case 'view':
        setSelectedFeedback(fb);
        setIsViewOpen(true);
        break;
      case 'edit':
        navigate({ to: '/dashboard/feedback/edit/$edit-id', params: { 'edit-id': String(fb.id) } });
        break;
      case 'acknowledge':
        updateFeedback.mutate({ id: String(fb.id), data: { status: 'Acknowledged' } });
        break;
      case 'resolve':
        updateFeedback.mutate({ id: String(fb.id), data: { status: 'Resolved' } });
        setIsViewOpen(false);
        break;
      case 'reject':
        updateFeedback.mutate({ id: String(fb.id), data: { status: 'Rejected' } });
        setIsViewOpen(false);
        break;
      case 'delete':
        setIsViewOpen(false); // Close drawer before opening delete modal
        setSelectedId(String(fb.id));
        setSelectedTitle(fb.mainMessage || 'this feedback');
        setIsDeleteOpen(true);
        break;
      default:
        alert(`${action} → ${fb.mainMessage}`);
        break;
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedId) {
      deleteFeedback.mutate(selectedId, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedId(undefined);
          setSelectedTitle('');
        },
      });
    }
  };

  const getActions = (fb: FeedbackEntity): FeedbackAction[] => {
    const actions: FeedbackAction[] = [
      { key: 'view', label: 'View Details', icon: <FaEye className="w-4 h-4" />, destructive: false },
    ];

    if (fb.status === 'submitted') {
      actions.push({ key: 'acknowledge', label: 'Acknowledge', icon: <FaCheckCircle className="w-4 h-4" />, destructive: false });
    }

    if (fb.status === 'Acknowledged') {
      actions.push({ key: 'resolve', label: 'Resolve', icon: <FaCheckCircle className="w-4 h-4" />, destructive: false });
    }

    if (fb.status !== 'Resolved' && fb.status !== 'Rejected') {
      actions.push({ key: 'reject', label: 'Reject', icon: <FaTimesCircle className="w-4 h-4" />, destructive: true });
    }

    actions.push({ key: 'delete', label: 'Delete', icon: <FaTrash className="w-4 h-4" />, destructive: true });

    return actions;
  };

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Feedbacks"]} title="Feedbacks" className='absolute top-0 left-0 px-6 w-full' />

      <div className="pt-14">
        <MainToolbar
          title="Feedbacks"
          viewMode={viewMode}
          setViewMode={setViewMode}
          search={search}
          setSearch={(value) => { setSearch(value); setPage(1); }}
          filteredCount={meta?.total ?? 0}
          showCreate={true}
          createButton={{ to: '/dashboard/feedback/add-new', label: 'Make Feedback', icon: <FaPlus /> }}
        />
      </div>

      {viewMode === 'list' ? (
        <FeedbackTable
          feedbacks={feedbacks}
          getStatusColor={getStatusColor}
          getInitials={getInitials}
          getActions={getActions}
          handleAction={handleAction}
          isLoading={isLoading}
        />
      ) : (
        <FeedbackGrid
          feedbacks={feedbacks}
          getStatusColor={getStatusColor}
          getInitials={getInitials}
          getActions={getActions}
          handleAction={handleAction}
          isLoading={isLoading}
        />
      )}

      <FeedbackPagination
        currentPage={page}
        totalPages={meta?.totalPages ?? 1}
        paginatedCount={feedbacks.length}
        filteredCount={meta?.total ?? 0}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
      />

      <DeleteFeedbackModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        feedbackId={selectedId}
        feedbackTitle={selectedTitle}
        onConfirm={handleDeleteConfirm}
      />

      <FeedbackDetailsDrawer
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        feedback={selectedFeedback}
        getStatusColor={getStatusColor}
        getInitials={getInitials}
        onResolve={selectedFeedback?.status === 'Acknowledged' ? (fb) => handleAction('resolve', fb) : undefined}
        onReject={selectedFeedback?.status !== 'Resolved' && selectedFeedback?.status !== 'Rejected' ? (fb) => handleAction('reject', fb) : undefined}
        onDelete={(fb) => handleAction('delete', fb)}
      />
    </div>
  );
};

export const Route = createFileRoute('/dashboard/feedback/')({
  component: FeedbacksPage,
});