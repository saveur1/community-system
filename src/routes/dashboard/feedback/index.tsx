import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaEye, FaShare, FaEdit, FaTrash, FaPause, FaPlay, FaStop, FaChartBar, FaDownload } from 'react-icons/fa';
import DeleteFeedbackModal from '@/components/pages/feedbacks/delete-feedback-modal';
import { FeedbackItem, FeedbackAction } from '@/utility/types';
import { FeedbackTable } from '@/components/pages/feedbacks/feedbacks-table';
import { FeedbackGrid } from '@/components/pages/feedbacks/feedbacks-grid-view';
import { FeedbackToolbar } from '@/components/pages/feedbacks/feedback-toolbar';
import { FeedbackPagination } from '@/components/pages/feedbacks/feedback-pagination';

const FeedbacksPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([
    { id: 1, programme: 'Immunization', feedbackType: 'Positive', response: 'Staff were kind and the service was quick.', followUpNeeded: false, email: 'immunization@community.org', responses: 210, questions: 8, time: '4 min', status: 'Active' },
    { id: 2, programme: 'Maternal Health', feedbackType: 'Suggestion', response: 'Consider extending clinic hours for working parents.', followUpNeeded: true, email: 'maternal@community.org', responses: 145, questions: 10, time: '6 min', status: 'Draft' },
    { id: 3, programme: 'Facility Experience', feedbackType: 'Negative', response: 'Wait times were long and seating was limited.', followUpNeeded: true, email: 'facility@community.org', responses: 320, questions: 12, time: '7 min', status: 'Completed' },
    { id: 4, programme: 'Outreach Program', feedbackType: 'Concern', response: 'Information did not reach remote areas effectively.', followUpNeeded: false, email: 'outreach@community.org', responses: 82, questions: 6, time: '3 min', status: 'Pending' },
  ]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [selectedTitle, setSelectedTitle] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return feedbacks;
    return feedbacks.filter((f) =>
      [f.programme, f.feedbackType, f.response, f.email, f.status].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [feedbacks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Draft': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-red-100 text-red-800';
      case 'Pending': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (text: string) => text.split(' ').map((n) => n[0]).join('').toUpperCase();

  const handleAction = (action: string, fb: FeedbackItem) => {
    switch (action) {
      case 'delete':
        setSelectedId(fb.id);
        setSelectedTitle(fb.programme);
        setIsDeleteOpen(true);
        break;
      default:
        alert(`${action} → ${fb.programme}`);
        break;
    }
  };

  const handleDeleteConfirm = (id: number) => {
    setFeedbacks((prev) => prev.filter((x) => x.id !== id));
    setIsDeleteOpen(false);
    setSelectedId(undefined);
    setSelectedTitle('');
  };

  const getActions = (fb: FeedbackItem): FeedbackAction[] => {
    const base = [
      { key: 'view', label: 'View Details', icon: <FaEye className="w-4 h-4" />, destructive: false },
      { key: 'edit', label: 'Edit', icon: <FaEdit className="w-4 h-4" />, destructive: false },
    ];
    
    if (fb.status === 'Active' || fb.status === 'Completed') {
      base.push({ key: 'analytics', label: 'Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false });
      base.push({ key: 'export', label: 'Export', icon: <FaDownload className="w-4 h-4" />, destructive: false });
    }
    base.push({ key: 'delete', label: 'Delete', icon: <FaTrash className="w-4 h-4" />, destructive: true });
    return base;
  };

  return (
    <div className="pb-10">
      <Breadcrumb items={["Community", "Feedbacks"]} title="Feedbacks" className='absolute top-0 left-0 px-6 w-full' />

      <div className="pt-14">
        <FeedbackToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          search={search}
          setSearch={(value) => { setSearch(value); setPage(1); }}
          filteredCount={filtered.length}
        />
      </div>

      {viewMode === 'list' ? (
        <FeedbackTable
          feedbacks={paginated}
          getStatusColor={getStatusColor}
          getInitials={getInitials}
          getActions={getActions}
          handleAction={handleAction}
        />
      ) : (
        <FeedbackGrid
          feedbacks={paginated}
          getStatusColor={getStatusColor}
          getInitials={getInitials}
          getActions={getActions}
          handleAction={handleAction}
        />
      )}

      <FeedbackPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginatedCount={paginated.length}
        filteredCount={filtered.length}
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
    </div>
  );
};

export const Route = createFileRoute('/dashboard/feedback/')({
  component: FeedbacksPage,
});