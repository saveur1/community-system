import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaEye, FaTrash, FaDownload, FaShare, FaEllipsisV, FaVideo, FaImage, FaMusic, FaFileAlt, FaPlus, FaEdit } from 'react-icons/fa';
import { BsExclamationOctagon } from 'react-icons/bs';
import { useCommunitySessionsList } from '@/hooks/useCommunitySession';
import type { CommunitySessionEntity } from '@/api/community-sessions';
import FilePreview from '@/components/common/file-preview';
import { checkPermissions } from '@/utility/logicFunctions';
import useAuth from '@/hooks/useAuth';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const SessionTypeIcon = ({ type }: { type: CommunitySessionEntity['type'] }) => {
  switch (type) {
    case 'video': return <FaVideo className="text-red-500" />;
    case 'image': return <FaImage className="text-blue-500" />;
    case 'audio': return <FaMusic className="text-purple-500" />;
    case 'document': return <FaFileAlt className="text-green-600" />;
    default: return null;
  }
};

const CommunitySessionsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CommunitySessionEntity | null>(null);
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  const { data, isLoading } = useCommunitySessionsList({ page, limit: pageSize, allowed: true, search: search.trim() || undefined });
  const sessions = data?.result ?? [];
  const total = data?.total ?? sessions.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / pageSize));

  const filteredSessions = useMemo(() => {
    // Since backend now handles search, we can remove client-side filtering
    return sessions;
  }, [sessions]);

  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions; // server-side pagination already applied

  const handleAction = (action: string, session: CommunitySessionEntity) => {
    switch (action) {
      case 'preview':
        {
          const url = session.document?.documentUrl ?? undefined;
          if (!url) return;
          window.open(url, '_blank');
        }
        break;
      case 'download':
        // Simple download via opening the URL (adjust if backend needs auth headers)
        {
          const url = session.document?.documentUrl ?? undefined;
          if (!url) return;
          window.open(url, '_blank');
        }
        break;
      case 'share':
        {
          const url = session.document?.documentUrl;
          if (!url) return;
          navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard!'));
        }
        break;
      case 'edit':
        navigate({ to: `/dashboard/community-sessions/edit/${session.id}` });
        break;
      case 'delete':
        setToDelete(session);
        setDeleteModalOpen(true);
        break;
      default:
        alert(`${action} on ${session.title}`);
    }
  };

  const confirmDelete = (_id: string) => {
    // Hook for deletion is available: useDeleteCommunitySession()
    // Keeping UI modal; actual deletion should call the mutation elsewhere when integrated
    setDeleteModalOpen(false);
    setToDelete(null);
  };

  const renderGrid = () => {
    if (paginatedSessions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <BsExclamationOctagon className="text-6xl mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No Community Sessions Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
            {search.trim()
              ? `No sessions match "${search}". Try adjusting your search terms.`
              : "Get started by creating your first community session!"
            }
          </p>
          {!search.trim() && checkPermissions(user, 'community_session:create') && (
            <Link
              to="/dashboard/community-sessions/add-new"
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              <FaPlus className="inline mr-2" />
              Create First Session
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 lg:gap-6">
        {paginatedSessions.map(session => (
          <div key={session.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
            <Link to="/dashboard/community-sessions/$sessionId" params={{ sessionId: session.id }}>
              <div className="w-full h-32 sm:h-40 lg:h-48 bg-gray-100 dark:bg-gray-700">
                <FilePreview
                  src={session.document?.documentUrl || undefined}
                  filename={session.document?.documentName || undefined}
                  type={session.type}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="p-3 lg:p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="text-sm lg:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                    <Link to="/dashboard/community-sessions/$sessionId" params={{ sessionId: session.id }} className="hover:text-primary transition-colors">
                      {session.title}
                    </Link>
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <SessionTypeIcon type={session.type} />
                  <CustomDropdown
                    trigger={
                      <button className="p-1.5 lg:p-2 dark:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <FaEllipsisV className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    }
                    dropdownClassName='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 w-40'
                    position='bottom-right'
                    portal={true}
                  >
                    <DropdownItem onClick={() => handleAction('preview', session)} className="text-xs lg:text-sm">
                      <FaEye className="mr-2 w-3 h-3 lg:w-4 lg:h-4" />Preview
                    </DropdownItem>
                    <DropdownItem onClick={() => handleAction('edit', session)} className="text-xs lg:text-sm">
                      <FaEdit className="mr-2 w-3 h-3 lg:w-4 lg:h-4" />Edit
                    </DropdownItem>
                    <DropdownItem onClick={() => handleAction('download', session)} className="text-xs lg:text-sm">
                      <FaDownload className="mr-2 w-3 h-3 lg:w-4 lg:h-4" />Download
                    </DropdownItem>
                    <DropdownItem onClick={() => handleAction('share', session)} className="text-xs lg:text-sm">
                      <FaShare className="mr-2 w-3 h-3 lg:w-4 lg:h-4" />Share
                    </DropdownItem>
                    <DropdownItem onClick={() => handleAction('delete', session)} className="text-red-500 text-xs lg:text-sm" destructive>
                      <FaTrash className="mr-2 w-3 h-3 lg:w-4 lg:h-4" />Delete
                    </DropdownItem>
                  </CustomDropdown>
                </div>
              </div>
              <Link to="/dashboard/community-sessions/$sessionId" params={{ sessionId: session.id }}>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                  {session.shortDescription}
                </p>
              </Link>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Show offline indicator when not online
  if (!isOnline) {
    return (
      <div className="pb-6 lg:pb-10 px-2 lg:px-0">
        <Breadcrumb
          title="Community Sessions"
          items={[
            { link: '/dashboard', title: 'Dashboard' },
            'Community Sessions'
          ]}
          className='absolute top-0 left-0 w-full px-4 lg:px-6 bg-white dark:bg-gray-900'
        />
        <div className="pt-20">
          <OfflineIndicator 
            title="Community Sessions Not Available Offline"
            message="The community sessions page requires an internet connection to load and manage session data. Please check your connection and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6 lg:pb-10 px-2 lg:px-0">
      <Breadcrumb
        title="Community Sessions"
        items={[
          { link: '/dashboard', title: 'Dashboard' },
          'Community Sessions'
        ]}
        className='absolute top-0 left-0 w-full px-4 lg:px-6 bg-white dark:bg-gray-900'
      />
      <div className="pt-20">
        <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Title and Count */}
            <div className="flex items-center">
              <h2 className="text-lg lg:text-xl font-bold text-gray-700 dark:text-gray-200 mr-2">Community Sessions</h2>
              <span className="text-gray-500 text-sm lg:text-base">({total})</span>
            </div>

            {/* Search and Add Session Container */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 items-start sm:items-center">
              {/* Search Input */}
              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search sessions..."
                  className="w-full sm:max-w-xs border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 text-sm lg:text-base"
                />
              </div>

              {/* Add Session Button */}
              {checkPermissions(user, 'community_session:create') && (
                <Link
                  to="/dashboard/community-sessions/add-new"
                  className="bg-primary flex items-center gap-2 text-white px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm cursor-pointer text-sm lg:text-base whitespace-nowrap"
                >
                  <FaPlus className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>Add Session</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-10">Loading sessions...</div>
        ) : (
          renderGrid()
        )}

        {/* Pagination */}
        <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pb-6 lg:pb-8">
          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
            Showing {paginatedSessions.length} of {total} sessions
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <button
                className="px-2 lg:px-3 py-1 lg:py-2 rounded border border-gray-300 dark:border-gray-600 text-xs lg:text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-2 lg:px-3 py-1 lg:py-2 rounded border border-gray-300 dark:border-gray-600 text-xs lg:text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <select
              className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs lg:text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark"
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              {[6, 9, 12, 24].map(sz => <option key={sz} value={sz}>{sz} / page</option>)}
            </select>
          </div>
        </div>

        {/* Delete confirm modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 lg:p-6 w-full max-w-sm mx-4">
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Session</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete "<span className="font-medium">{toDelete?.title}</span>"? This action is permanent.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  className="px-4 py-2 dark:text-white rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                  onClick={() => toDelete && confirmDelete(toDelete.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/community-sessions/')({
  component: CommunitySessionsPage,
});
