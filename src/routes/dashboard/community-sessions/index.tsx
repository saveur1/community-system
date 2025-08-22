import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaEye, FaTrash, FaDownload, FaShare, FaEllipsisV, FaVideo, FaImage, FaMusic } from 'react-icons/fa';
import { communitySessions as mockSessions, type CommunitySession } from '../../../components/features/community-sessions/mock-data';

const SessionTypeIcon = ({ type }: { type: CommunitySession['type'] }) => {
  switch (type) {
    case 'video': return <FaVideo className="text-red-500" />;
    case 'image': return <FaImage className="text-blue-500" />;
    case 'audio': return <FaMusic className="text-purple-500" />;
    default: return null;
  }
};

const CommunitySessionsPage = () => {
  const [sessions, setSessions] = useState<CommunitySession[]>(mockSessions);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<CommunitySession | null>(null);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAction = (action: string, session: CommunitySession) => {
    switch (action) {
      case 'preview':
        window.open(session.url, '_blank');
        break;
      case 'download':
        alert(`Downloading ${session.title}... (demo)`);
        break;
      case 'share':
        navigator.clipboard.writeText(session.url).then(() => alert('Link copied to clipboard!'));
        break;
      case 'delete':
        setToDelete(session);
        setDeleteModalOpen(true);
        break;
      default:
        alert(`${action} on ${session.title}`);
    }
  };

  const confirmDelete = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setDeleteModalOpen(false);
    setToDelete(null);
  };

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedSessions.map(session => (
        <div key={session.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
          <img src={session.thumbnail} alt={session.title} className="w-full h-48 object-cover" />
          <div className="p-4 bg-white">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">{session.title}</h3>
              <SessionTypeIcon type={session.type} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 h-10 overflow-hidden">{session.description}</p>
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{new Date(session.uploadedAt).toLocaleDateString()}</span>
              <CustomDropdown
                trigger={<button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><FaEllipsisV /></button>}
              >
                <DropdownItem onClick={() => handleAction('preview', session)}><FaEye className="mr-2" />Preview</DropdownItem>
                <DropdownItem onClick={() => handleAction('download', session)}><FaDownload className="mr-2" />Download</DropdownItem>
                <DropdownItem onClick={() => handleAction('share', session)}><FaShare className="mr-2" />Share</DropdownItem>
                <DropdownItem onClick={() => handleAction('delete', session)} className="text-red-500" destructive><FaTrash className="mr-2" />Delete</DropdownItem>
              </CustomDropdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <Breadcrumb title="Community Sessions" items={['Dashboard', 'Community Sessions']} className='absolute top-0 left-0 w-full'/>
      <div className="pt-16">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mr-2">Community Sessions</h2>
            <span className="text-gray-500">({filteredSessions.length})</span>
          </div>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search sessions..."
              className="w-64 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {renderGrid()}

      {/* Pagination */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pb-8">
        <div className="text-sm text-gray-600 dark:text-gray-400">Showing {paginatedSessions.length} of {filteredSessions.length} sessions</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border dark:border-gray-600 disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
          <span className="text-sm text-gray-700 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
          <button className="px-3 py-1 rounded border dark:border-gray-600 disabled:opacity-50" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
          <select className="ml-2 border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {[6, 9, 12, 24].map(sz => <option key={sz} value={sz}>{sz} / page</option>)}
          </select>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Session</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete "<span className="font-medium">{toDelete?.title}</span>"? This action is permanent.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-md border dark:border-gray-600" onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700" onClick={() => toDelete && confirmDelete(toDelete.id)}>Delete</button>
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
