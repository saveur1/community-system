import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import {  HiOutlineClock, HiOutlinePencil } from 'react-icons/hi';
import { SelectDropdown } from '@/components/ui/select';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { useAnnouncementsList, useDeleteAnnouncement, useUpdateAnnouncement, useAnnouncement } from '@/hooks/useAnnouncements';
import Drawer from '@/components/ui/drawer';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import type { AnnouncementEntity } from '@/api/announcements';
import { spacer } from '@/utility/logicFunctions';
import { FaEllipsisH } from 'react-icons/fa';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

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
  const { isOnline } = useNetworkStatus();

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
  const totalItems = announcementsResp?.total ?? (announcementsResp ? announcements.length : 0);
  const totalPages = Math.max(1, Math.ceil((announcementsResp?.total ?? 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = announcements; // server already paginates based on params

  // Show offline indicator when not online
  if (!isOnline) {
    return (
      <div className="space-y-6 pb-10">
        <Breadcrumb
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            'Announcements'
          ]}
          title="Announcements"
          className="absolute top-0 left-0 w-full px-4 lg:px-6 bg-white dark:bg-gray-900"
        />
        <div className="pt-20">
          <OfflineIndicator 
            title="Announcements Not Available Offline"
            message="The announcements page requires an internet connection to load and manage announcement data. Please check your connection and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumb
        items={[
          { title: 'Dashboard', link: '/dashboard' },
          'Announcements'
        ]}
        title="Announcements"
        className="absolute top-0 left-0 w-full px-4 lg:px-6 bg-white dark:bg-gray-900"
      />

      {/* Toolbar */}
      <div className="pt-20">
        <div className="bg-white dark:bg-gray-800 border rounded-lg border-gray-300 dark:border-gray-600 p-3 lg:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search and Filter Container */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  placeholder="Search announcements..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-primary"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="w-full sm:w-48">
                <SelectDropdown
                  value={statusFilter}
                  onChange={(v) => { setStatusFilter(v as any); setPage(1); }}
                  options={[
                    { label: 'All Status', value: 'all' },
                    { label: 'Stopped', value: 'stopped' },
                    { label: 'Active', value: 'sent' }
                  ]}
                  placeholder="Filter by status"
                  triggerClassName="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Add Button */}
            <Link
              to="/dashboard/announcements/add-new"
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors font-medium shadow-sm whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Announcement</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </div>
      </div>

      {/* History / List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4 lg:mb-0">
            <HiOutlineClock className="w-5 h-5" />
            <span className="font-medium text-sm lg:text-base">Announcement History</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">({totalItems})</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {announcementsLoading ? (
                <tr><td colSpan={5} className="px-4 lg:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">Loading announcements...</td></tr>
              ) : announcementsError ? (
                <tr><td colSpan={5} className="px-4 lg:px-6 py-8 text-center text-sm text-red-500">Failed to load announcements</td></tr>
              ) : paginated.map((a) => (
                 <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                   <td className="px-4 lg:px-6 py-4">
                     <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.title}</div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{a.message}</div>
                   </td>
                   <td className="px-4 lg:px-6 py-4">
                     <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${a.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                         a.status === 'scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                           'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                         }`}>
                       {a.status}
                     </span>
                   </td>
                   <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(a.createdAt)}</td>
                   <td className="px-4 lg:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{formatDateTime(a.scheduledAt || '')}</td>
                   <td className="px-4 lg:px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2 text-gray-500 dark:text-gray-400">
                       <Link
                         className="hover:text-primary p-2 rounded transition-colors"
                         title="Edit"
                         to= '/dashboard/announcements/$edit-id'
                         params={{ 'edit-id': a.id }}
                       >
                         <HiOutlinePencil className="w-4 h-4" />
                       </Link>
                       <CustomDropdown
                         trigger={
                           <button className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Actions">
                             <FaEllipsisH className="w-4 h-4" />
                           </button>
                         }
                         position="bottom-right"
                         portal={true}
                         dropdownClassName='w-40'
                       >
                         <div className="w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-gray-600">
                           <DropdownItem onClick={() => openDetails(a.id)}>View details</DropdownItem>
                           <DropdownItem
                             onClick={async () => {
                               try {
                                 await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'sent' } });
                               } catch (e) {}
                           }}
                           className="text-green-700 dark:text-green-400"
                         >
                           Activate
                         </DropdownItem>
                         <DropdownItem
                           onClick={async () => {
                             try {
                               await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'stopped' } });
                             } catch (e) {}
                           }}
                           className="text-red-600 dark:text-red-400"
                         >
                           Stop
                         </DropdownItem>
                         <DropdownItem
                           onClick={() => { setDeleteId(a.id); setConfirmOpen(true); }}
                           className="text-red-700 dark:text-red-400"
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
                  <td colSpan={5} className="px-4 lg:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No announcements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {announcementsLoading ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading announcements...</div>
          ) : announcementsError ? (
            <div className="p-6 text-center text-sm text-red-500">Failed to load announcements</div>
          ) : paginated.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">No announcements found.</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginated.map((a) => (
                <div key={a.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${a.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            a.status === 'scheduled' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                          {a.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{a.message}</p>
                      <div className="flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <div>Created: {formatDateTime(a.createdAt)}</div>
                        {a.scheduledAt && <div>Scheduled: {formatDateTime(a.scheduledAt)}</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        className="p-2 hover:text-primary rounded transition-colors"
                        title="Edit"
                        to='/dashboard/announcements/$edit-id'
                        params={{ 'edit-id': a.id }}
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <CustomDropdown
                        trigger={
                          <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" aria-label="Actions">
                            •••
                          </button>
                        }
                        position="bottom-right"
                      >
                        <div className="w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black/5 dark:ring-gray-600">
                          <DropdownItem onClick={() => openDetails(a.id)}>View details</DropdownItem>
                          <DropdownItem
                            onClick={async () => {
                              try {
                                await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'sent' } });
                              } catch (e) {}
                            }}
                            className="text-green-700 dark:text-green-400"
                          >
                            Activate
                          </DropdownItem>
                          <DropdownItem
                            onClick={async () => {
                              try {
                                await updateAnnouncement.mutateAsync({ id: a.id, payload: { status: 'stopped' } });
                              } catch (e) {}
                            }}
                            className="text-red-600 dark:text-red-400"
                          >
                            Stop
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => { setDeleteId(a.id); setConfirmOpen(true); }}
                            className="text-red-700 dark:text-red-400"
                          >
                            Delete
                          </DropdownItem>
                        </div>
                      </CustomDropdown>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-3 lg:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 text-sm">
          <div className="text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            Showing <span className="font-medium">{paginated.length}</span> of <span className="font-medium">{totalItems}</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Prev
              </button>
              <span className="px-2 text-gray-700 dark:text-gray-300">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
            <div className="w-20">
              <SelectDropdown
                value={pageSize.toString()}
                onChange={(v) => { setPageSize(Number(v)); setPage(1); }}
                options={[
                  { label: '5', value: '5' },
                  { label: '10', value: '10' },
                  { label: '20', value: '20' },
                ]}
                placeholder="Size"
                triggerClassName="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-xs"
              />
            </div>
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
