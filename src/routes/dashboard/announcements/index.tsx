import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import {  HiOutlineClock, HiOutlinePencil, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import { SelectDropdown } from '@/components/ui/select';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useAnnouncementsList, useDeleteAnnouncement, useUpdateAnnouncement, useAnnouncement } from '@/hooks/useAnnouncements';
import Drawer from '@/components/ui/drawer';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { AnnouncementEntity } from '@/api/announcements';
import { spacer } from '@/utility/logicFunctions';

// Types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  status: 'draft' | 'scheduled' | 'sent' | 'stopped';
  createdAt?: string; // ISO
  scheduledAt?: string | null; // ISO
  allowedRoles?: string[]; // add this field
  viewDetailsLink?: string | null; // add this field
}

function AnnouncementsPage() {
  // List state
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Announcement['status']>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Drawer state for viewing details
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);

  // API hooks
  const params = useMemo(() => {
    const p: any = { page, limit: pageSize };
    if (statusFilter && statusFilter !== 'all') p.status = statusFilter;
    if (query && query.trim().length > 0) p.q = query.trim();
    return p;
  }, [page, pageSize, statusFilter, query]);

  const { data: announcementsResp, isLoading: announcementsLoading, isError: announcementsError } = useAnnouncementsList(params);
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const openDetails = (id: string) => {
    setActiveAnnouncementId(id);
    setDrawerOpen(true);
  };
  const closeDetails = () => {
    setDrawerOpen(false);
    setActiveAnnouncementId(null);
  };

  const { data: announcementDetailResp, isLoading: detailLoading } = useAnnouncement(activeAnnouncementId ?? undefined, !!activeAnnouncementId);
  const activeAnnouncement = announcementDetailResp?.result;


  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteAnnouncement.mutateAsync(deleteId);
      } catch (err) {
        // error handled by hook
      }
    }
    setDeleteId(null);
    setConfirmOpen(false);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Use server-provided list (backend paginates)
  const announcements: AnnouncementEntity[] = announcementsResp?.result ?? [];
  const totalItems = announcementsResp?.meta?.total ?? (announcementsResp ? announcements.length : 0);
  const totalPages = Math.max(1, Math.ceil((announcementsResp?.meta?.total ?? 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = announcements; // server already paginates based on params

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb
        items={["Dashboard", "Announcements"]}
        title="Announcements"
        className="absolute top-0 left-0 w-full px-6"
      />

      {/* Toolbar */}
      <div className="pt-20">
        <div className="bg-white border rounded-lg border-gray-300 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search announcements..."
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

          <Link
            to="/dashboard/announcements/add-new"
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg flex items-center"
          >
            <FiPlus className="mr-2" /> New Announcement
          </Link>
        </div>
      </div>

      {/* History / List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-gray-700">
            <HiOutlineClock />
            <span className="font-medium">Announcement History</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search announcements..."
                className="w-64 border border-gray-300 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="w-48">
              <SelectDropdown
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Sent', value: 'sent' },
                  { label: 'Scheduled', value: 'scheduled' },
                  { label: 'Draft', value: 'draft' },
                ]}
                placeholder="Filter status"
              />
            </div>
          </div>
        </div>

        <div className="">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {announcementsLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">Loading announcements...</td></tr>
              ) : announcementsError ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-red-500">Failed to load announcements</td></tr>
              ) : paginated.map((a) => (
                 <tr key={a.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4">
                     <div className="text-sm font-medium text-gray-800">{a.title}</div>
                     <div className="text-xs text-gray-500 line-clamp-1">{a.message}</div>
                   </td>
                   <td className="px-6 py-4">
                     <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${a.status === 'sent' ? 'bg-green-100 text-green-800' :
                         a.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                           'bg-gray-100 text-gray-800'
                         }`}>
                       {a.status}
                     </span>
                   </td>
                   <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.createdAt)}</td>
                   <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.scheduledAt || '')}</td>
                   <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-3 text-gray-500">
                       <Link
                         className="hover:text-primary p-2 rounded"
                         title="Edit"
                         to= '/dashboard/announcements/$edit-id'
                         params={{ 'edit-id': a.id }}
                       >
                         <HiOutlinePencil className="w-5 h-5" />
                       </Link>
                       <CustomDropdown
                         trigger={
                           <button className="px-2 py-1 rounded hover:bg-gray-100" aria-label="Actions">
                             •••
                           </button>
                         }
                         position="bottom-right"
                       >
                         <div className="w-44 bg-white rounded-md shadow-lg ring-1 ring-black/5">
                           <DropdownItem onClick={() => openDetails(a.id)}>View details</DropdownItem>
                           <DropdownItem
                             onClick={async () => {
                               try {
                                 await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'sent' } });
                               } catch (e) {}
                           }}
                           className="text-green-700"
                         >
                           Activate
                         </DropdownItem>
                         <DropdownItem
                           onClick={async () => {
                             try {
                               await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'stopped' } });
                             } catch (e) {}
                           }}
                           className="text-red-600"
                         >
                           Stop
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => { setDeleteId(a.id); setConfirmOpen(true); }}
                           className="text-red-700"
                         >
                           Delete
                         </DropdownItem>
                       </div>
                     </CustomDropdown>
                   </div>
                 </td>
                 </tr>
               ))}

              {(!announcementsLoading && !announcementsError && paginated.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No announcements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex items-center justify-between border-t border-gray-200 text-sm">
          <div className="text-gray-600">
            Showing <span className="font-medium">{paginated.length}</span> of <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border rounded disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>
            <span className="px-2">{currentPage} / {totalPages}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border rounded disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="ml-2 border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete Announcement" size="sm">
        <ModalBody>
          <p className="text-sm text-gray-700">Are you sure you want to delete this announcement? This action cannot be undone.</p>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</ModalButton>
          <ModalButton variant="danger" onClick={handleConfirmDelete}>Delete</ModalButton>
        </ModalFooter>
      </Modal>

      {/* Drawer for announcement details */}
      <Drawer open={drawerOpen} onClose={closeDetails} title={activeAnnouncement?.title ?? 'Announcement details'} placement="right" width={450}>
        <div className="p-4 space-y-4">
          {detailLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : activeAnnouncement ? (
            <>
              <div className="text-sm text-gray-600">Created: {formatDateTime(activeAnnouncement.createdAt)}</div>
              <div className="text-lg font-semibold text-gray-900">{activeAnnouncement.title}</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{activeAnnouncement.message}</div>
              {activeAnnouncement.viewDetailsLink && (
                <div>
                  <a href={activeAnnouncement.viewDetailsLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">View details link</a>
                </div>
              )}
              {activeAnnouncement.allowedRoles && activeAnnouncement.allowedRoles.length > 0 && (
                <div className="pt-4">
                  <div className="text-sm text-gray-600 mb-2">Allowed roles</div>
                  <div className="flex flex-wrap gap-2">
                    {activeAnnouncement.allowedRoles.map((r: any) => (
                      <span key={r.id} className="text-xs px-2 py-1 bg-gray-100 rounded capitalize">{spacer(r.name)}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">No details</div>
          )}
        </div>
      </Drawer>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/announcements/')({
  component: AnnouncementsPage,
});
