import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react';
import Breadcrumb from '@/components/ui/breadcrum';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaList, FaTh, FaEdit, FaTrash, FaEllipsisV, FaEye, FaShare, FaPause, FaPlay, FaStop, FaChartBar, FaDownload } from 'react-icons/fa';

type ProgrammeStatus = 'Active' | 'Draft' | 'Archived' | 'Planned';

interface ProgrammeItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: ProgrammeStatus;
  targetGroup: string; // e.g., Children 0-5, Adolescents, Adults, Seniors
  feedbacks: number; // total feedbacks collected
}

const ProgrammesComponent = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: number; name: string } | null>(null);

  // Seed from landing programmes (hiv-aids, immunization, mental-health, malaria, nutrition)
  const [programmes, setProgrammes] = useState<ProgrammeItem[]>([
    { id: 1, name: 'HIV/AIDS', slug: 'hiv-aids', description: 'HIV prevention, testing and treatment support', status: 'Active', targetGroup: 'Adults', feedbacks: 1240 },
    { id: 2, name: 'Immunization', slug: 'immunization', description: 'Routine childhood and adult immunization programmes', status: 'Active', targetGroup: 'Children 0-5', feedbacks: 980 },
    { id: 3, name: 'Mental Health', slug: 'mental-health', description: 'Community awareness and mental health support services', status: 'Planned', targetGroup: 'Adolescents', feedbacks: 312 },
    { id: 4, name: 'Malaria', slug: 'malaria', description: 'Prevention and rapid response to malaria cases', status: 'Draft', targetGroup: 'All Ages', feedbacks: 455 },
    { id: 5, name: 'Nutrition', slug: 'nutrition', description: 'Nutrition education and supplementation programmes', status: 'Archived', targetGroup: 'Pregnant Women', feedbacks: 777 },
  ]);

  // search & pagination
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return programmes;
    return programmes.filter((p) =>
      [p.name, p.slug, p.description, p.status, p.targetGroup].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [programmes, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  const getStatusColor = (status: ProgrammeStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      case 'Planned':
        return 'bg-purple-100 text-purple-800';
      case 'Archived':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleProgrammeAction = (action: string, programmeId: number, programmeName: string) => {
    console.log(`${action} action for programme:`, programmeId, programmeName);
    switch (action) {
      case 'view':
        navigate({ to: '/dashboard/programmes/$view-id', params: { 'view-id': String(programmeId) } });
        break;
      case 'edit':
        alert(`Editing programme: ${programmeName}`);
        break;
      case 'duplicate':
        alert(`Duplicating programme: ${programmeName}`);
        break;
      case 'share':
        alert(`Sharing programme: ${programmeName}`);
        break;
      case 'pause':
        alert(`Pausing programme: ${programmeName}`);
        break;
      case 'resume':
        alert(`Resuming programme: ${programmeName}`);
        break;
      case 'stop':
        alert(`Stopping programme: ${programmeName}`);
        break;
      case 'analytics':
        alert(`Viewing analytics for: ${programmeName}`);
        break;
      case 'export':
        alert(`Exporting data for: ${programmeName}`);
        break;
      case 'delete':
        setToDelete({ id: programmeId, name: programmeName });
        setDeleteModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleConfirmDelete = (programmeId: number) => {
    setProgrammes(prev => prev.filter(p => p.id !== programmeId));
    setDeleteModalOpen(false);
    setToDelete(null);
  };

  const getProgrammeActions = (programme: ProgrammeItem) => {
    const actions = [
      { key: 'share', label: 'Share', icon: <FaShare className="w-4 h-4" />, destructive: false },
    ];

    if (programme.status === 'Active') {
      actions.push(
        { key: 'pause', label: 'Pause', icon: <FaPause className="w-4 h-4" />, destructive: false },
        { key: 'stop', label: 'Stop', icon: <FaStop className="w-4 h-4" />, destructive: true },
      );
    } else if (programme.status === 'Draft' || programme.status === 'Planned') {
      actions.push(
        { key: 'resume', label: 'Activate', icon: <FaPlay className="w-4 h-4" />, destructive: false },
      );
    }

    if (programme.status === 'Active' || programme.status === 'Archived') {
      actions.push(
        { key: 'analytics', label: 'Analytics', icon: <FaChartBar className="w-4 h-4" />, destructive: false },
        { key: 'export', label: 'Export', icon: <FaDownload className="w-4 h-4" />, destructive: false },
      );
    }

    actions.push({ key: 'delete', label: 'Delete', icon: <FaTrash className="w-4 h-4" />, destructive: true });
    return actions;
  };

  const renderTableView = () => (
    <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-visible">
      <table className="min-w-full">
        <thead className="border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Programme</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Target Group</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feedbacks</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginated.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {getInitials(p.name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">{p.name}</div>
                    <div className="text-xs text-gray-500">/{p.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{p.targetGroup}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{p.feedbacks}</td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleProgrammeAction('edit', p.id, p.name)}
                    className="text-primary cursor-pointer hover:text-blue-700"
                    title="Edit Programme"
                  >
                    <FaEdit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleProgrammeAction('view', p.id, p.name)}
                    className="text-title cursor-pointer hover:text-shadow-title"
                    title="View Programme"
                  >
                    <FaEye className="w-4 h-4" />
                  </button>
                  <CustomDropdown
                    trigger={
                      <button className="text-gray-400 cursor-pointer hover:text-gray-600 p-1">
                        <FaEllipsisV className="w-4 h-4" />
                      </button>
                    }
                    position="bottom-right"
                    dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
                  >
                    {getProgrammeActions(p).map((action) => (
                      <DropdownItem
                        key={action.key}
                        icon={action.icon}
                        destructive={action.destructive as boolean}
                        onClick={() => handleProgrammeAction(action.key, p.id, p.name)}
                      >
                        {action.label}
                      </DropdownItem>
                    ))}
                  </CustomDropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginated.map((p) => (
        <div key={p.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-lg font-medium mr-4">
              {getInitials(p.name)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-700 mb-1">{p.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(p.status)}`}>
                {p.status}
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-600">{p.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{p.feedbacks} feedbacks</span>
              <span>Target: {p.targetGroup}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">/{p.slug}</span>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleProgrammeAction('edit', p.id, p.name)}
                className="text-primary hover:text-blue-700"
                title="Edit Programme"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleProgrammeAction('delete', p.id, p.name)}
                className="text-red-500 hover:text-red-700"
                title="Delete Programme"
              >
                <FaTrash className="w-4 h-4" />
              </button>
              <CustomDropdown
                trigger={<button className="text-gray-400 hover:text-gray-600 p-1"><FaEllipsisV className="w-4 h-4" /></button>}
                position="bottom-right"
                dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
              >
                {getProgrammeActions(p).map((action) => (
                  <DropdownItem
                    key={action.key}
                    icon={action.icon}
                    destructive={action.destructive as boolean}
                    className='min-w-52'
                    onClick={() => handleProgrammeAction(action.key, p.id, p.name)}
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
        items={["Community", "Programmes"]}
        title="Programmes"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-14">
        <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-600 mr-2">Programme List</h2>
            <span className="text-gray-500 text-lg">({filtered.length})</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search programmes..."
                className="w-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center bg-white rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <FaList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <FaTh className="w-4 h-4" />
              </button>
            </div>
            <Link to="/dashboard/programmes/add-new" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2">
              <span className="text-lg">+</span>
              Add Programme
            </Link>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Showing {paginated.length} of {filtered.length} programmes
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded border disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
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

      {/* Simple delete confirm inline (no modal component yet) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Programme</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Are you sure you want to delete <span className="font-medium">{toDelete?.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-md border" onClick={() => { setDeleteModalOpen(false); setToDelete(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white" onClick={() => toDelete && handleConfirmDelete(toDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const Route = createFileRoute('/dashboard/programmes/')({
  component: ProgrammesComponent,
})
