import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaList, FaTh, FaEdit, FaTrash, FaEllipsisV, FaEye, FaPlus } from 'react-icons/fa';
import { useProjectsList, useDeleteProject } from '@/hooks/useProjects';
import { spacer } from '@/utility/logicFunctions';
import MainToolbar from '@/components/common/main-toolbar';

// Align status with backend `ProjectStatus` from `src/api/projects.ts`
type ProgrammeStatus = 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

interface ProgrammeItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  status: ProgrammeStatus;
  targetGroup: string | null;
  projectDuration?: string | null;
  geographicArea?: string | null;
}

const ProgrammesComponent = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  // Backend pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const { data, isLoading, isError, refetch, isFetching } = useProjectsList({ page, limit: pageSize });
  const deleteProject = useDeleteProject();

  // search & pagination
  const [search, setSearch] = useState('');
  const serverItems: ProgrammeItem[] = useMemo(() => {
    const list = data?.result ?? [];
    // Map API shape to UI shape if needed
    return list.map((it) => ({
      id: it.id,
      name: it.name,
      status: it.status as ProgrammeStatus,
      targetGroup: it.targetGroup ?? null,
      slug: it.name?.toLowerCase().replace(/\s+/g, '-'),
      projectDuration: it.projectDuration ?? null,
      geographicArea: it.geographicArea ?? null,
      description: undefined,
    }));
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return serverItems;
    return serverItems.filter((p) =>
      [p.name, p.slug ?? '', p.description ?? '', p.status, p.targetGroup ?? '', p.projectDuration ?? '', p.geographicArea ?? '']
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [serverItems, search]);

  const totalPages = Math.max(1, data?.meta?.totalPages ?? 1);
  const currentPage = Math.min(data?.meta?.page ?? page, totalPages);
  const totalCount = data?.meta?.total ?? filtered.length;
  const paginated = filtered; // server already paginates; filtering is within current page only

  const getStatusColor = (status: ProgrammeStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-200 text-gray-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleProgrammeAction = (action: string, programmeId: string, programmeName: string) => {
    console.log(`${action} action for project:`, programmeId, programmeName);
    switch (action) {
      case 'view':
        navigate({ to: '/dashboard/projects/$view-id', params: { 'view-id': String(programmeId) } });
        break;
      case 'edit':
        navigate({ to: '/dashboard/projects/edit/$edit-id', params: { 'edit-id': String(programmeId) } });
        break;
      case 'duplicate':
        alert(`Duplicating project: ${programmeName}`);
        break;
      case 'share':
        alert(`Sharing project: ${programmeName}`);
        break;
      case 'pause':
        alert(`Pausing project: ${programmeName}`);
        break;
      case 'resume':
        alert(`Resuming project: ${programmeName}`);
        break;
      case 'stop':
        alert(`Stopping project: ${programmeName}`);
        break;
      case 'analytics':
        alert(`Viewing analytics for: ${programmeName}`);
        break;
      case 'download':
        alert(`Downloading report for: ${programmeName}`);
        break;
      case 'delete':
        setToDelete({ id: programmeId, name: programmeName });
        setDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmDelete = (programmeId: string) => {
    deleteProject.mutate(programmeId, {
      onSettled: () => {
        setDeleteModalOpen(false);
        setToDelete(null);
        // ensure data is fresh
        refetch();
      },
    });
  };

  const getProgrammeActions = (programme: ProgrammeItem) => [
    { label: 'View', onClick: () => handleProgrammeAction('view', programme.id, programme.name), icon: <FaEye /> },
    { label: 'Edit', onClick: () => handleProgrammeAction('edit', programme.id, programme.name), icon: <FaEdit /> },
    { label: 'Delete', onClick: () => handleProgrammeAction('delete', programme.id, programme.name), icon: <FaTrash />, destructive: true },
  ];

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Target Group</th>
            <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Geographic Area</th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Duration</th>
            <th className="px-3 lg:px-6 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {paginated.map((programme) => (
            <tr key={programme.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs lg:text-sm">
                    {getInitials(programme.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{programme.name}</div>
                    {programme.slug && <div className="text-xs text-gray-500 truncate lg:block">/{programme.slug}</div>}
                    {/* Show hidden info on mobile */}
                    <div className="lg:hidden mt-1 space-y-1">
                      {programme.targetGroup && (
                        <div className="text-xs text-gray-500">Target: {programme.targetGroup}</div>
                      )}
                      {programme.geographicArea && (
                        <div className="text-xs text-gray-500">Area: {programme.geographicArea}</div>
                      )}
                      {programme.projectDuration && (
                        <div className="text-xs text-gray-500">Duration: {programme.projectDuration}</div>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{programme.targetGroup ?? '-'}</td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize border border-green-300 ${getStatusColor(programme.status)}`}>
                  {spacer(programme.status)}
                </span>
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{programme.geographicArea ?? '-'}</td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{programme.projectDuration ?? '-'}</td>
              <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <CustomDropdown
                  trigger={<button className="p-1 lg:p-2 hover:bg-gray-100 rounded-md transition-colors" aria-label="More actions"><FaEllipsisV className="w-3 h-3 lg:w-4 lg:h-4" /></button>}
                  position="bottom-right"
                  dropdownClassName="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
                >
                  {getProgrammeActions(programme).map((action) => (
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
              <td className="px-3 lg:px-6 py-8 text-center text-sm text-gray-500" colSpan={6}>
                {isLoading || isFetching ? 'Loading projects...' : isError ? 'Failed to load projects.' : 'No projects found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 w-full sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {paginated.map((programme) => (
        <div key={programme.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-3 lg:mb-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm lg:text-lg font-medium mr-3 lg:mr-4">
              {getInitials(programme.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">{programme.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(programme.status)}`}>
                {spacer(programme.status)}
              </span>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3 mb-3 lg:mb-4">
            {programme.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{programme.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 lg:gap-2 text-xs lg:text-sm text-gray-500 dark:text-gray-300">
              <span className="truncate">Target: {programme.targetGroup ?? '-'}</span>
              <span className="truncate">Area: {programme.geographicArea ?? '-'}</span>
              <span className="truncate sm:col-span-2">Duration: {programme.projectDuration ?? '-'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 truncate">/{programme.slug}</span>
            <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
              <button
                onClick={() => handleProgrammeAction('edit', programme.id, programme.name)}
                className="text-primary hover:text-blue-700 p-1"
                title="Edit Project"
              >
                <FaEdit className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <button
                onClick={() => handleProgrammeAction('delete', programme.id, programme.name)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete Project"
              >
                <FaTrash className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              <CustomDropdown
                trigger={<button className="text-gray-400 hover:text-gray-600 p-1"><FaEllipsisV className="w-3 h-3 lg:w-4 lg:h-4" /></button>}
                position="bottom-right"
                dropdownClassName="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
              >
                {getProgrammeActions(programme).map((action) => (
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
      {paginated.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            {isLoading || isFetching ? 'Loading projects...' : isError ? 'Failed to load projects.' : 'No projects found.'}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="pb-6 lg:pb-10 px-2 lg:px-0">
      <Breadcrumb
        items={["Community", "Projects"]}
        title="Projects"
        className='absolute top-0 left-0 w-full px-4 lg:px-6'
      />

      <div className="pt-12 lg:pt-14">
        <MainToolbar
          title="Project List"
          filteredCount={totalCount}
          search={search}
          setSearch={(value) => { setSearch(value); setPage(1); }}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showCreate={true}
          createButton={{ 
            to: "/dashboard/projects/add-new", 
            label: "Add Project", 
            icon: <FaPlus /> 
          }}
        />
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}

      {/* Pagination */}
      <div className="mt-4 lg:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 lg:px-0">
        <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 order-2 sm:order-1">
          Showing {paginated.length} of {totalCount} projects
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 lg:gap-3 order-1 sm:order-2">
          <div className="flex items-center gap-2">
            <button
              className="px-2 lg:px-3 py-1 lg:py-2 rounded border border-gray-300 dark:border-gray-600 text-xs lg:text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setPage((p) => Math.max(1, (data?.meta?.page ?? p) - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Prev
            </button>
            <span className="text-xs lg:text-sm text-gray-700 dark:text-gray-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-2 lg:px-3 py-1 lg:py-2 rounded border border-gray-300 dark:border-gray-600 text-xs lg:text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setPage((p) => Math.min(totalPages, (data?.meta?.page ?? p) + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Next
            </button>
          </div>
          <select
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs lg:text-sm bg-white dark:bg-gray-800 min-w-0"
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Project</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete <span className="font-medium">{toDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-md border" onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white" onClick={() => toDelete && handleConfirmDelete(toDelete.id)} disabled={deleteProject.isPending}>
                {deleteProject.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/dashboard/projects/')({
  component: ProgrammesComponent,
})
