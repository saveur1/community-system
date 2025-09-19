import { useMemo, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useSurveysList, useDeleteSurvey } from '@/hooks/useSurveys';
import type { SurveysListParams } from '@/api/surveys';
import { toast } from 'react-toastify';

export const Route = createFileRoute('/dashboard/surveys/rapid-enquiry/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'active' | 'paused' | 'archived'>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const params = useMemo(() => {
    const p: SurveysListParams = { page, limit: pageSize, surveyType: 'rapid-enquiry' };
    // map status filter if applied
    if (statusFilter !== 'all') p.status = statusFilter;
    return p;
  }, [page, pageSize, statusFilter]);

  const { data, isLoading } = useSurveysList(params);
  const deleteSurvey = useDeleteSurvey();
  // const updateStatus = useUpdateSurveyStatus();

  const list = useMemo(() => data?.result ?? [], [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((s: any) => String(s.title ?? '').toLowerCase().includes(q));
  }, [list, query]);

  const totalPages = data?.meta?.totalPages ?? Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered; // server-paginated already; we only filter client-side by query

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
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

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb items={['Dashboard', 'Rapid Enquiry']} title="Rapid Enquiry" className="absolute top-0 left-0 w-full px-6" />

      <div className="pt-20">
        <div className="bg-white border rounded-lg border-gray-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search rapid enquiries..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <Link to="/dashboard/surveys/rapid-enquiry/add-new" className="ml-4 px-4 py-2 bg-primary text-white rounded-lg flex items-center">
            <FiPlus className="mr-2" /> New Rapid Enquiry
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            Rapid Enquiry History
          </div>
          <div className="text-sm text-gray-600">Showing {filtered.length} item(s)</div>
        </div>

        <div>
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No rapid enquiries found.</td></tr>
              ) : paginated.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{s.title}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(s.startAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(s.endAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">{s.status}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-gray-500">
                      <button
                        onClick={() => navigate({ to: '/dashboard/surveys/rapid-enquiry/$edit-id', params: { 'edit-id': s.id } })}
                        className="hover:text-primary p-2 rounded"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteId(s.id); setConfirmOpen(true); }}
                        className="text-red-600 hover:text-red-800 p-2 rounded"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between border-t border-gray-200 text-sm">
          <div className="text-gray-600">Showing {paginated.length} of {data?.meta?.total ?? filtered.length}</div>
          <div className="flex items-center gap-2">
            <button disabled={currentPage <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 border rounded disabled:opacity-50">Prev</button>
            <span className="px-2">{currentPage} / {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1.5 border rounded disabled:opacity-50">Next</button>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 border rounded px-2 py-1">
              {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Rapid Enquiry" size="sm">
        <ModalBody>
          <p className="text-sm text-gray-700">Are you sure you want to delete this rapid enquiry? This cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</ModalButton>
          <ModalButton variant="danger" onClick={() => handleDelete()}>Delete</ModalButton>
        </ModalFooter>
      </Modal>
    </div>
  );
}
