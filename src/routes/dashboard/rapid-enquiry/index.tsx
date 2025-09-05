import React, { useEffect, useMemo, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { FiPlus, FiSearch } from 'react-icons/fi';

type RapidEnquiry = {
  id: string;
  title: string;
  link: string;
  scheduledAt?: string | null;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
};

const STORAGE_KEY = 'rapid_enquiries';

function loadItems(): RapidEnquiry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RapidEnquiry[];
  } catch {
    return [];
  }
}

function saveItems(items: RapidEnquiry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const Route = createFileRoute('/dashboard/rapid-enquiry/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RapidEnquiry[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RapidEnquiry['status']>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setItems(loadItems());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || (i.link ?? '').toLowerCase().includes(q);
    });
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleDelete = async (id?: string) => {
    const toDelete = id ?? deleteId;
    if (!toDelete) return;
    const next = items.filter(i => i.id !== toDelete);
    setItems(next);
    saveItems(next);
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
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <Link to="/dashboard/rapid-enquiry/add-new" className="ml-4 px-4 py-2 bg-primary text-white rounded-lg flex items-center">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No rapid enquiries found.</td></tr>
              ) : paginated.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{a.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={a.link} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline break-all">{a.link}</a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.scheduledAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-gray-500">
                      <button
                        onClick={() => navigate({ to: '/dashboard/rapid-enquiry/$edit-id', params: { 'edit-id': a.id } })}
                        className="hover:text-primary p-2 rounded"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteId(a.id); setConfirmOpen(true); }}
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
          <div className="text-gray-600">Showing {paginated.length} of {filtered.length}</div>
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
