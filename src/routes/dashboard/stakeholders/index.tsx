import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaList, FaTh, FaEdit, FaTrash, FaEllipsisV, FaEye } from 'react-icons/fa';
import { useStakeholdersList, useDeleteStakeholder } from '@/hooks/useStakeholders';

interface StakeholderItem {
  id: string;
  name: string;
  logo: string | null;
  projects?: any[];
}

const StakeholdersComponent = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  // Backend pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const { data, isLoading, isError, refetch, isFetching } = useStakeholdersList({ page, limit: pageSize });
  const deleteStakeholder = useDeleteStakeholder();

  // search & pagination
  const [search, setSearch] = useState('');
  const serverItems: StakeholderItem[] = useMemo(() => {
    const list = data?.result ?? [];
    // Map API shape to UI shape if needed
    return list.map((it) => ({
      id: it.id,
      name: it.name,
      logo: it.logo,
      projects: it.projects ?? [],
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return serverItems;
    return serverItems.filter((s) =>
      [s.name].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [serverItems, search]);

  const totalPages = Math.max(1, data?.totalPages ?? 1);
  const currentPage = Math.min(data?.page ?? page, totalPages);
  const totalCount = data?.total ?? filtered.length;
  const paginated = filtered; // server already paginates; filtering is within current page only

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleStakeholderAction = (action: string, stakeholderId: string, stakeholderName: string) => {
    console.log(`${action} action for stakeholder:`, stakeholderId, stakeholderName);
    switch (action) {
      case 'view':
        navigate({ to: '/dashboard/stakeholders/$view-id', params: { 'view-id': String(stakeholderId) } });
        break;
      case 'edit':
        navigate({ to: '/dashboard/stakeholders/$edit-id', params: { 'edit-id': String(stakeholderId) } });
        break;
      case 'duplicate':
        alert(`Duplicating stakeholder: ${stakeholderName}`);
        break;
      case 'share':
        alert(`Sharing stakeholder: ${stakeholderName}`);
        break;
      case 'analytics':
        alert(`Viewing analytics for: ${stakeholderName}`);
        break;
      case 'download':
        alert(`Downloading report for: ${stakeholderName}`);
        break;
      case 'delete':
        setToDelete({ id: stakeholderId, name: stakeholderName });
        setDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmDelete = (stakeholderId: string) => {
    deleteStakeholder.mutate(stakeholderId, {
      onSettled: () => {
        setDeleteModalOpen(false);
        setToDelete(null);
        // ensure data is fresh
        refetch();
      },
    });
  };

  const getStakeholderActions = (stakeholder: StakeholderItem) => [
    { label: 'View', onClick: () => handleStakeholderAction('view', stakeholder.id, stakeholder.name), icon: <FaEye /> },
    { label: 'Edit', onClick: () => handleStakeholderAction('edit', stakeholder.id, stakeholder.name), icon: <FaEdit /> },
    { label: 'Delete', onClick: () => handleStakeholderAction('delete', stakeholder.id, stakeholder.name), icon: <FaTrash />, destructive: true },
  ];

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stakeholder</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Logo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Projects</th>
            <th className="px-6 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paginated.map((stakeholder) => (
            <tr key={stakeholder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                    {getInitials(stakeholder.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{stakeholder.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {stakeholder.logo ? (
                  <img 
                    src={stakeholder.logo} 
                    alt={`${stakeholder.name} logo`}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No logo</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {stakeholder.projects?.length ?? 0} projects
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <CustomDropdown
                  trigger={<button className="p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="More actions"><FaEllipsisV /></button>}
                  position="bottom-right"
                  dropdownClassName="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
                >
                  {getStakeholderActions(stakeholder).map((action) => (
                    <DropdownItem
                      key={action.label}
                      icon={action.icon}
                      destructive={action.destructive as boolean}
                      className='min-w-52'
                      onClick={action.onClick}
                    >
                      {action.label}
                    </DropdownItem>
                  ))}
                </CustomDropdown>
              </td>
            </tr>
          ))}
          {paginated.length === 0 && (
            <tr>
              <td className="px-6 py-8 text-center text-sm text-gray-500" colSpan={4}>
                {isLoading || isFetching ? 'Loading stakeholders...' : isError ? 'Failed to load stakeholders.' : 'No stakeholders found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginated.map((stakeholder) => (
        <div key={stakeholder.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-medium mr-4">
              {getInitials(stakeholder.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{stakeholder.name}</h3>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-300">Logo:</span>
              {stakeholder.logo ? (
                <img 
                  src={stakeholder.logo} 
                  alt={`${stakeholder.name} logo`}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">No logo</span>
              )}
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-300">
              <span>{stakeholder.projects?.length ?? 0} projects</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-300">Stakeholder</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStakeholderAction('edit', stakeholder.id, stakeholder.name)}
                className="text-primary hover:text-blue-700"
                title="Edit Stakeholder"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStakeholderAction('delete', stakeholder.id, stakeholder.name)}
                className="text-red-500 hover:text-red-700"
                title="Delete Stakeholder"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              <CustomDropdown
                trigger={<button className="text-gray-400 hover:text-gray-600 p-1"><FaEllipsisV className="w-4 h-4" /></button>}
                position="bottom-right"
                dropdownClassName="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
              >
                {getStakeholderActions(stakeholder).map((action) => (
                  <DropdownItem
                    key={action.label}
                    icon={action.icon}
                    destructive={action.destructive as boolean}
                    className='min-w-52'
                    onClick={action.onClick}
                  >
                    {action.label}
                  </DropdownItem>
                ))}
              </CustomDropdown>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      <Breadcrumb
        items={["Community", "Stakeholders"]}
        title="Stakeholders"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-14">
        <div className="flex w-full bg-white dark:bg-gray-800 px-4 py-2 my-6 border border-gray-300 dark:border-gray-700 rounded-md items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-600 dark:text-gray-100 mr-2">Stakeholder List</h2>
            <span className="text-gray-500 dark:text-gray-300 text-lg">({totalCount})</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search stakeholders..."
                className="w-64 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === `list` ? `bg-primary text-white shadow-sm` : `text-gray-600 dark:text-gray-300 hover:text-gray-800`}`}
              >
                <FaList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === `grid` ? `bg-primary text-white shadow-sm` : `text-gray-600 dark:text-gray-300 hover:text-gray-800`}`}
              >
                <FaTh className="w-4 h-4" />
              </button>
            </div>
            <Link to="/dashboard/stakeholders/add-new" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2">
              <span className="text-lg">+</span>
              Add Stakeholder
            </Link>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Showing {paginated.length} of {totalCount} stakeholders
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, (data?.page ?? p) - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, (data?.page ?? p) + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </button>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[6, 9, 12, 24].map((sz) => (
              <option key={sz} value={sz}>{sz} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Simple delete confirm inline */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Stakeholder</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete <span className="font-medium">{toDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-md border" onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white" onClick={() => toDelete && handleConfirmDelete(toDelete.id)} disabled={deleteStakeholder.isPending}>
                {deleteStakeholder.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/dashboard/stakeholders/')({
  component: StakeholdersComponent,
}) 