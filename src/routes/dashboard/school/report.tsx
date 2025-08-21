import React, { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import Drawer from '@/components/ui/drawer';
import { FiEye, FiEdit3, FiTrash2, FiSearch, FiGrid, FiList } from 'react-icons/fi';

export type SchoolReport = {
  id: number;
  school: string;
  totalStudents: number;
  vaccinatedStudents: number;
  reason: string;
  reportedAt: string;
  tag?: string;
};

const SchoolReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [reports, setReports] = useState<SchoolReport[]>([
    { id: 1, school: 'UR - Nyarugenge', totalStudents: 12840, vaccinatedStudents: 9758, reason: 'HPV campaign follow-up', reportedAt: '2025-08-10 10:00', tag: 'District' },
    { id: 2, school: "GS Saint Michel", totalStudents: 1540, vaccinatedStudents: 1212, reason: 'Missed second dose', reportedAt: '2025-08-12 09:20', tag: 'Cell Leaders' },
    { id: 3, school: 'GS Kiyovu', totalStudents: 860, vaccinatedStudents: 690, reason: 'Parents consent pending', reportedAt: '2025-08-15 14:30', tag: 'Health Center A' },
    { id: 4, school: 'GS Nyamirambo', totalStudents: 1320, vaccinatedStudents: 1108, reason: 'Outreach in progress', reportedAt: '2025-08-18 16:45', tag: 'Sector' },
  ]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selected, setSelected] = useState<SchoolReport | undefined>(undefined);

  const filtered = useMemo(() => {
    return reports.filter(r =>
      r.school.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const handleDelete = (id: number) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    if (window.confirm(`Delete report for ${report.school}?`)) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const Toolbar = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-2 rounded border ${viewMode === 'list' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200'}`}
          title="List view"
        >
          <FiList className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-2 rounded border ${viewMode === 'grid' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200'}`}
          title="Grid view"
        >
          <FiGrid className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 md:max-w-sm relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search school or reason..."
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => alert('Coming soon: add school report')}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Add Report
        </button>
      </div>
    </div>
  );

  const ListTable = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">School</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">No. of Students</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">No. Vaccinated</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Coverage</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reason</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Reported At</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginated.map(r => {
              const coverage = Math.round((r.vaccinatedStudents / Math.max(1, r.totalStudents)) * 100);
              return (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{r.tag ?? 'School'}</span>
                      <span className="text-gray-900 font-medium">{r.school}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-gray-700">{r.totalStudents.toLocaleString()}</td>
                  <td className="py-3 px-6 text-gray-700">{r.vaccinatedStudents.toLocaleString()}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <span className={coverage >= 80 ? 'text-success font-medium' : 'text-title font-medium'}>{coverage}%</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded max-w-[140px]">
                        <div
                          className={`h-2 rounded ${coverage >= 80 ? 'bg-success' : 'bg-primary'}`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-gray-700">{r.reason}</td>
                  <td className="py-3 px-6 text-gray-700">{r.reportedAt}</td>
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => { setSelected(r); setIsViewOpen(true); }}
                        title="View"
                      >
                        <FiEye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => { setSelected(r); setIsEditOpen(true); }}
                        title="Edit"
                      >
                        <FiEdit3 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        onClick={() => handleDelete(r.id)}
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        <span className="text-sm text-gray-500">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries</span>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
          >
            {[5, 10, 20].map(s => <option key={s} value={s}>{s}/page</option>)}
          </select>
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">{page} / {totalPages}</span>
          <button
            className="px-3 py-1 rounded border hover:bg-gray-100"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const GridCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {paginated.map(r => {
        const coverage = Math.round((r.vaccinatedStudents / Math.max(1, r.totalStudents)) * 100);
        return (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">{r.tag ?? 'School'}</span>
                  <h3 className="text-base font-semibold text-gray-900">{r.school}</h3>
                </div>
                <div className="text-sm text-gray-600">{r.reportedAt}</div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 hover:bg-gray-100 rounded" title="View" onClick={() => { setSelected(r); setIsViewOpen(true); }}>
                  <FiEye className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded" title="Edit" onClick={() => { setSelected(r); setIsEditOpen(true); }}>
                  <FiEdit3 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-1.5 hover:bg-gray-100 rounded" title="Delete" onClick={() => handleDelete(r.id)}>
                  <FiTrash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">No. of Students</div>
                <div className="text-gray-900 font-medium">{r.totalStudents.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">No. Vaccinated</div>
                <div className="text-gray-900 font-medium">{r.vaccinatedStudents.toLocaleString()}</div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <span className={coverage >= 80 ? 'text-success font-medium' : 'text-title font-medium'}>{coverage}%</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded">
                    <div className={`h-2 rounded ${coverage >= 80 ? 'bg-success' : 'bg-primary'}`} style={{ width: `${coverage}%` }} />
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{r.reason}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <Breadcrumb
        title="School Reports"
        items={["Dashboard", "School", "Reports"]}
        className="absolute top-0 left-0 w-full"
      />

      <div className="pb-4 pt-12">
        <Toolbar />
        {viewMode === 'list' ? <ListTable /> : <GridCards />}
      </div>

      {/* View Drawer */}
      <Drawer open={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Details for ${selected?.school ?? ''}`}>
        {selected && (
          <div className="p-4 space-y-2">
            <p><strong>School:</strong> {selected.school}</p>
            <p><strong>No. of Students:</strong> {selected.totalStudents.toLocaleString()}</p>
            <p><strong>No. Vaccinated:</strong> {selected.vaccinatedStudents.toLocaleString()}</p>
            <p><strong>Coverage:</strong> {Math.round((selected.vaccinatedStudents / Math.max(1, selected.totalStudents)) * 100)}%</p>
            <p><strong>Reason:</strong> {selected.reason}</p>
            <p><strong>Reported At:</strong> {selected.reportedAt}</p>
          </div>
        )}
      </Drawer>

      {/* Edit Drawer */}
      <Drawer open={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit report: ${selected?.school ?? ''}`}>
        {selected && (
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">No. of Students</label>
                <input
                  type="number"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selected.totalStudents}
                  onChange={(e) => setSelected({ ...selected, totalStudents: parseInt(e.target.value || '0', 10) })}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">No. Vaccinated</label>
                <input
                  type="number"
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={selected.vaccinatedStudents}
                  onChange={(e) => setSelected({ ...selected, vaccinatedStudents: parseInt(e.target.value || '0', 10) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600">Reason</label>
              <textarea
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={selected.reason}
                onChange={(e) => setSelected({ ...selected, reason: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded border hover:bg-gray-100" onClick={() => setIsEditOpen(false)}>Cancel</button>
              <button
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                onClick={() => {
                  if (!selected) return;
                  setReports(prev => prev.map(r => r.id === selected.id ? selected : r));
                  setIsEditOpen(false);
                }}
              >
                Save changes
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export const Route = createFileRoute('/dashboard/school/report')({
  component: SchoolReportsPage,
});
