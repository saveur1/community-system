import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { ReportPagination } from '@/components/features/immunization/report/report-pagination';
import { FaList, FaTh, FaEye, FaEllipsisV, FaTimes } from 'react-icons/fa';
import Drawer from '@/components/ui/drawer';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';

// Local type for Family Immunization Report
interface FamilyImmunizationReport {
  id: number;
  familyLeaderName: string;
  nationalId: string;
  childrenCount: number;
  vaccinesGiven: number;
  vaccines?: string[];
}

// Toolbar specific for Family page (mirrors ReportToolbar styling)
const FamilyToolbar = ({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  filteredCount,
  onAdd,
}: {
  viewMode: 'list' | 'grid';
  onViewModeChange: (m: 'list' | 'grid') => void;
  search: string;
  onSearchChange: (v: string) => void;
  filteredCount: number;
  onAdd: () => void;
}) => (
  <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
    <div className="flex items-center">
      <h2 className="text-xl font-bold text-gray-600 mr-2">Family Immunization</h2>
      <span className="text-gray-500 text-lg">({filteredCount})</span>
    </div>
    <div className="flex-1" />
    <div className="flex items-center gap-3">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by leader or ID..."
        className="hidden md:block border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex items-center bg-white rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <FaList className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
        >
          <FaTh className="w-4 h-4" />
        </button>
      </div>
      <button onClick={onAdd} className="px-3 py-2 rounded-md bg-primary text-white text-sm hover:bg-blue-600 shadow-sm">
        Add Family Report
      </button>
    </div>
  </div>
);

// Table view
const FamilyTable = ({
  reports,
  onAction,
}: {
  reports: FamilyImmunizationReport[];
  onAction: (action: 'view' | 'edit' | 'delete', id: number) => void;
}) => (
  <div className="bg-white w-full rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <table className="min-w-full">
      <thead className="border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Family Leader</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">National ID</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900"># Children</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Vaccines Given</th>
          <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reports.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 text-sm text-gray-800">{r.familyLeaderName}</td>
            <td className="px-6 py-4 text-sm text-gray-800">{r.nationalId}</td>
            <td className="px-6 py-4 text-sm text-gray-800">{r.childrenCount}</td>
            <td className="px-6 py-4 text-sm text-gray-800">{r.vaccinesGiven}</td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <button onClick={() => onAction('view', r.id)} className="text-primary hover:text-blue-700" title="View">
                  <FaEye className="w-4 h-4" />
                </button>
                <CustomDropdown
                  position="bottom-left"
                  dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36"
                  trigger={<button className="p-2 rounded-md hover:bg-gray-100" title="More"><FaEllipsisV className="w-4 h-4 text-gray-700" /></button>}
                >
                  <DropdownItem onClick={() => onAction('edit', r.id)}>Edit</DropdownItem>
                  <DropdownItem destructive onClick={() => onAction('delete', r.id)}>Delete</DropdownItem>
                </CustomDropdown>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Grid view
const FamilyGrid = ({
  reports,
  onAction,
}: {
  reports: FamilyImmunizationReport[];
  onAction: (action: 'view' | 'edit' | 'delete', id: number) => void;
}) => (
  <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-3 gap-6">
    {reports.map((r) => (
      <div key={r.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-600"><strong>Leader:</strong> {r.familyLeaderName}</div>
            <div className="text-sm text-gray-600"><strong>ID:</strong> {r.nationalId}</div>
            <div className="text-sm text-gray-600"><strong>Children:</strong> {r.childrenCount}</div>
            <div className="text-sm text-gray-600"><strong>Vaccines:</strong> {r.vaccinesGiven}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onAction('view', r.id)} className="text-primary hover:text-blue-700" title="View">
              <FaEye className="w-4 h-4" />
            </button>
            <CustomDropdown
              position="bottom-left"
              dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36"
              trigger={<button className="p-2 rounded-md hover:bg-gray-100" title="More"><FaEllipsisV className="w-4 h-4 text-gray-700" /></button>}
            >
              <DropdownItem onClick={() => onAction('edit', r.id)}>Edit</DropdownItem>
              <DropdownItem destructive onClick={() => onAction('delete', r.id)}>Delete</DropdownItem>
            </CustomDropdown>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const FamilyImmunizationPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [reports, setReports] = useState<FamilyImmunizationReport[]>([
    { id: 1, familyLeaderName: 'Alice Doe', nationalId: '1199-0000-1111-2222', childrenCount: 3, vaccinesGiven: 5 },
    { id: 2, familyLeaderName: 'Bob Smith', nationalId: '1199-0000-3333-4444', childrenCount: 2, vaccinesGiven: 3 },
    { id: 3, familyLeaderName: 'Clara Lee', nationalId: '1199-0000-5555-6666', childrenCount: 4, vaccinesGiven: 7 },
    { id: 4, familyLeaderName: 'David Kim', nationalId: '1199-0000-7777-8888', childrenCount: 1, vaccinesGiven: 1 },
  ]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selected, setSelected] = useState<FamilyImmunizationReport | undefined>(undefined);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return reports.filter(r =>
      r.familyLeaderName.toLowerCase().includes(term) ||
      r.nationalId.toLowerCase().includes(term)
    );
  }, [reports, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleAction = (action: 'view' | 'edit' | 'delete', id: number) => {
    const item = reports.find(r => r.id === id);
    if (!item) return;
    switch (action) {
      case 'view':
        setSelected(item);
        setIsViewOpen(true);
        break;
      case 'edit':
        setNewLeader(item.familyLeaderName);
        setNewId(item.nationalId);
        setNewChildren(item.childrenCount);
        setNewVaccines(item.vaccinesGiven);
        setSelectedVaccines(item.vaccines ?? []);
        setEditingId(item.id);
        setIsAddOpen(true);
        break;
      case 'delete':
        if (confirm(`Delete report for ${item.familyLeaderName}?`)) {
          setReports(prev => prev.filter(p => p.id !== id));
        }
        break;
    }
  };

  // Local add drawer state
  const [newLeader, setNewLeader] = useState('');
  const [newId, setNewId] = useState('');
  const [newChildren, setNewChildren] = useState<number | ''>('');
  const [newVaccines, setNewVaccines] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<number | null>(null);
  // Multi-select vaccines list
  const [availableVaccines, setAvailableVaccines] = useState<string[]>(['BCG','Polio','Measles','Hepatitis B']);
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [vSearch, setVSearch] = useState('');

  const resetNew = () => {
    setNewLeader('');
    setNewId('');
    setNewChildren('');
    setNewVaccines('');
  };

  const saveNew = () => {
    if (!newLeader || !newId || newChildren === '' || newVaccines === '') return;
    if (editingId) {
      setReports(prev => prev.map(p => p.id === editingId ? {
        ...p,
        familyLeaderName: newLeader,
        nationalId: newId,
        childrenCount: Number(newChildren),
        vaccinesGiven: Number(newVaccines),
        vaccines: selectedVaccines,
      } : p));
    } else {
      setReports(prev => [
        ...prev,
        {
          id: prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1,
          familyLeaderName: newLeader,
          nationalId: newId,
          childrenCount: Number(newChildren),
          vaccinesGiven: Number(newVaccines),
          vaccines: selectedVaccines,
        }
      ]);
    }
    setIsAddOpen(false);
    resetNew();
  };

  return (
    <>
      <Breadcrumb
        title="Family Immunization"
        items={["Dashboard", "Immunization", "Family"]}
        className="absolute top-0 left-0 w-full"
      />
      <div className="pb-4 pt-12">
        <FamilyToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          search={search}
          onSearchChange={setSearch}
          filteredCount={filtered.length}
          onAdd={() => setIsAddOpen(true)}
        />

        {viewMode === 'list' ? (
          <FamilyTable reports={paginated} onAction={handleAction} />
        ) : (
          <FamilyGrid reports={paginated} onAction={handleAction} />
        )}

        <ReportPagination
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />

        {/* View drawer */}
        <Drawer open={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Details - ${selected?.familyLeaderName ?? ''}`}>
          {selected && (
            <div className="p-4 space-y-2">
              <p><strong>Family Leader:</strong> {selected.familyLeaderName}</p>
              <p><strong>National ID:</strong> {selected.nationalId}</p>
              <p><strong># Children:</strong> {selected.childrenCount}</p>
              <p><strong>Vaccines Given:</strong> {selected.vaccinesGiven}</p>
            </div>
          )}
        </Drawer>

        {/* Add drawer */}
        <Drawer open={isAddOpen} onClose={() => { setIsAddOpen(false); setEditingId(null); }} title={editingId ? "Edit Family Report" : "Add Family Report"}>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Leader Name</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={newLeader}
                onChange={(e) => setNewLeader(e.target.value)}
                placeholder="Enter leader name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
              <input
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="Enter national ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of children in family</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={newChildren}
                onChange={(e) => setNewChildren(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of vaccines given</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={newVaccines}
                onChange={(e) => setNewVaccines(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vaccines (multi-select)</label>
              <CustomDropdown
                position="bottom-left"
                dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-full max-w-md"
                closeOnClick={false}
                trigger={
                  <div className="flex items-center flex-wrap gap-2 w-full min-h-[38px] border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white">
                    {selectedVaccines.length === 0 && (
                      <span className="text-gray-500">Select vaccines…</span>
                    )}
                    {selectedVaccines.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {v}
                        <button
                          type="button"
                          className="text-blue-700/80 hover:text-blue-900"
                          onClick={(e) => { e.stopPropagation(); setSelectedVaccines(prev => prev.filter(x => x !== v)); setAvailableVaccines(prev => [...prev, v].sort()); }}
                          title="Remove"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                }
              >
                <div className="px-1 pb-2">
                  <input
                    value={vSearch}
                    onChange={(e) => setVSearch(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Search vaccine…"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                  />
                </div>
                {availableVaccines.filter(v => v.toLowerCase().includes(vSearch.toLowerCase())).map(v => (
                  <DropdownItem key={v} onClick={(e) => { e.stopPropagation(); setSelectedVaccines(prev => [...prev, v]); setAvailableVaccines(prev => prev.filter(x => x !== v)); }}>
                    {v}
                  </DropdownItem>
                ))}
                {availableVaccines.filter(v => v.toLowerCase().includes(vSearch.toLowerCase())).length === 0 && (
                  <div className="px-3 py-2 text-xs text-gray-500">No matches</div>
                )}
              </CustomDropdown>
            </div>
            <div className="pt-2">
              <button className="px-3 py-2 rounded-md bg-primary text-white text-sm" onClick={saveNew}>Save</button>
            </div>
          </div>
        </Drawer>
      </div>
    </>
  );
};

export const Route = createFileRoute('/dashboard/immunization/family')({
  component: FamilyImmunizationPage,
});
