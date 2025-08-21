import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { AssignedImmunization, ImmunizationAction } from '@/utility/types';
import { AssignedTable } from '@/components/features/immunization/assigned/assigned-table';
import { AssignedGrid } from '@/components/features/immunization/assigned/assigned-grid-view';
import { AssignedToolbar } from '@/components/features/immunization/assigned/assigned-toolbar';
import { AssignedPagination } from '@/components/features/immunization/assigned/assigned-pagination';
import Drawer from '@/components/ui/drawer';
import ConfirmModal from '@/components/common/confirm-modal';

const AssignedImmunizationsPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [immunizations, setImmunizations] = useState<AssignedImmunization[]>([
    { id: 1, childName: 'John Doe', vaccine: 'BCG', dueDate: '2024-09-15', status: 'Pending', quantity: 1, assignedBy: 'Nurse Kelly' },
    { id: 2, childName: 'Jane Smith', vaccine: 'Polio', dueDate: '2024-09-20', status: 'Received', quantity: 2, assignedBy: 'Dr. Smith' },
    { id: 3, childName: 'Peter Jones', vaccine: 'Measles', dueDate: '2024-10-01', status: 'Pending', quantity: 1, assignedBy: 'Nurse Patel' },
    { id: 4, childName: 'Mary Williams', vaccine: 'Hepatitis B', dueDate: '2024-10-05', status: 'Missed', quantity: 3, assignedBy: 'Dr. Jones' },
  ]);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedImmunization, setSelectedImmunization] = useState<AssignedImmunization | undefined>(undefined);

  const handleAction = (action: ImmunizationAction, id: number) => {
    const immunization = immunizations.find(i => i.id === id);
    if (!immunization) return;

    switch (action) {
      case 'confirm':
        setSelectedId(id);
        setIsConfirmOpen(true);
        break;
      case 'view':
        setSelectedImmunization(immunization);
        setIsViewOpen(true);
        break;
      default:
        break;
    }
  };

  const onConfirm = () => {
    if (selectedId) {
      setImmunizations(immunizations.map(i => i.id === selectedId ? { ...i, status: 'Received' } : i));
    }
    setIsConfirmOpen(false);
    setSelectedId(undefined);
  };

  const filteredImmunizations = useMemo(() => {
    return immunizations.filter(i =>
      i.childName.toLowerCase().includes(search.toLowerCase()) ||
      i.vaccine.toLowerCase().includes(search.toLowerCase())
    );
  }, [immunizations, search]);

  const paginatedImmunizations = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredImmunizations.slice(start, start + pageSize);
  }, [filteredImmunizations, page, pageSize]);

  return (
    <>
      <Breadcrumb 
      title="Assigned Immunizations" 
      items={['Dashboard', 'Immunization', 'Assigned']} 
      className="absolute top-0 left-0 w-full"
      />
      <div className="pb-4 pt-12">
      <AssignedToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        search={search}
        onSearchChange={setSearch}
        filteredCount={filteredImmunizations.length}
      />

      {viewMode === 'list' ? (
        <AssignedTable immunizations={paginatedImmunizations} onAction={handleAction} />
      ) : (
        <AssignedGrid immunizations={paginatedImmunizations} onAction={handleAction} />
      )}

      <AssignedPagination
        page={page}
        pageSize={pageSize}
        total={filteredImmunizations.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirm}
        title="Confirm Receipt"
        message="Are you sure you want to mark this immunization as received?"
      />

      <Drawer open={isViewOpen} onClose={() => setIsViewOpen(false)} title={`Details for ${selectedImmunization?.childName}`}>
        {selectedImmunization && (
          <div className="p-4">
            <p><strong>Vaccine:</strong> {selectedImmunization.vaccine}</p>
            <p><strong>Due Date:</strong> {selectedImmunization.dueDate}</p>
            <p><strong>Status:</strong> {selectedImmunization.status}</p>
          </div>
        )}
      </Drawer>
      </div>
    </>
  );
};

export const Route = createFileRoute('/dashboard/immunization/assigned')({
  component: AssignedImmunizationsPage,
});