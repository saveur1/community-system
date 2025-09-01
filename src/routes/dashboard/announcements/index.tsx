import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { HiOutlineCalendar, HiOutlineClock, HiOutlineTrash, HiOutlineSpeakerphone, HiOutlinePencil, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import { SelectDropdown } from '@/components/ui/select';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import CustomCalendar from '@/components/ui/calendar';

// Types
interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: 'all' | 'stakeholders' | 'community' | 'rich_members' | 'providers';
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string; // ISO
  scheduledAt?: string; // ISO
}

const mockInitial: Announcement[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'We will have a scheduled maintenance on Friday 9PM-11PM. Services may be temporarily unavailable.',
    audience: 'all',
    status: 'sent',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '2',
    title: 'New Feedback Campaign',
    message: 'A new maternal health feedback drive starts next week. Please participate and share widely.',
    audience: 'community',
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

function AnnouncementsPage() {
  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<Announcement['audience']>('all');
  const [schedule, setSchedule] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [scheduledHour, setScheduledHour] = useState<string>('09');
  const [scheduledMinute, setScheduledMinute] = useState<string>('00');

  // List state
  const [items, setItems] = useState<Announcement[]>(mockInitial);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Announcement['status']>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setAudience('all');
    setSchedule(false);
    setScheduledDate(null);
    setScheduledHour('09');
    setScheduledMinute('00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const now = new Date();
    // Build scheduledAt ISO if schedule is enabled
    let iso: string | undefined = undefined;
    if (schedule && scheduledDate) {
      const h = Number(scheduledHour || '09');
      const m = Number(scheduledMinute || '00');
      const composed = new Date(
        scheduledDate.getFullYear(),
        scheduledDate.getMonth(),
        scheduledDate.getDate(),
        h,
        m,
        0,
        0
      );
      iso = composed.toISOString();
    }
    const newItem: Announcement = {
      id: String(Date.now()),
      title: title.trim(),
      message: message.trim(),
      audience,
      status: schedule && iso ? 'scheduled' : 'sent',
      createdAt: now.toISOString(),
      scheduledAt: iso,
    };

    setItems((prev) => [newItem, ...prev]);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      setItems((prev) => prev.filter((it) => it.id !== deleteId));
    }
    setDeleteId(null);
    setConfirmOpen(false);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '-';
    const d = new Date(iso);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;
    if (statusFilter !== 'all') list = list.filter((it) => it.status === statusFilter);
    if (q) list = list.filter((it) => `${it.title} ${it.message}`.toLowerCase().includes(q));
    return list;
  }, [items, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div className="pb-10">
      <Breadcrumb
        items={["Dashboard", "Announcements"]}
        title="Announcements"
        className="absolute top-0 left-0 w-full px-6"
      />

      {/* Composer */}
      <div className="pt-14">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineSpeakerphone className="text-primary" />
            New Announcement
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="e.g. Service downtime notice"
                />
              </div>
              <div>
                <SelectDropdown
                  label="Audience"
                  value={audience}
                  onChange={(val) => setAudience(val as Announcement['audience'])}
                  options={[
                    { label: 'All Users', value: 'all' },
                    { label: 'Stakeholders', value: 'stakeholders' },
                    { label: 'Community', value: 'community' },
                    { label: 'RICH Members', value: 'rich_members' },
                    { label: 'Health Service Providers', value: 'providers' },
                  ]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Write the announcement message..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center border border-gray-300 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <input
                  id="schedule"
                  type="checkbox"
                  checked={schedule}
                  onChange={(e) => setSchedule(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="schedule" className="text-sm text-gray-700">Schedule</label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  disabled={!schedule}
                  onClick={() => setSchedulePickerOpen(true)}
                  className={`w-full text-left border border-gray-300 rounded-md px-3 py-2 flex items-center justify-between ${!schedule ? 'bg-gray-50 text-gray-400' : 'bg-white hover:border-gray-400'}`}
                >
                  <span className={`text-sm ${!schedule ? 'text-gray-400' : 'text-gray-700'}`}>
                    {scheduledDate ? (
                      <> {scheduledDate.toLocaleDateString()} at {`${scheduledHour}:${scheduledMinute}`} </>
                    ) : (
                      <span>Pick date and time</span>
                    )}
                  </span>
                  <HiOutlineCalendar className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center cursor-pointer gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
              >
                <HiOutlineSpeakerphone />
                {schedule && scheduledDate ? 'Schedule' : 'Send now'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </form>
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search announcements..."
                className="w-64 border border-gray-300 rounded-md pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              <HiOutlineSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>
            <div className="w-48">
              <SelectDropdown
                value={statusFilter}
                onChange={(v) => setStatusFilter(v as any)}
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

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-800">{a.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">{a.message}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 capitalize">
                    {a.audience.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      a.status === 'sent' ? 'bg-green-100 text-green-800' :
                      a.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.createdAt)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{formatDateTime(a.scheduledAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 text-gray-500">
                      <button className="hover:text-gray-700 cursor-pointer" title="View"><HiOutlineEye /></button>
                      <button className="hover:text-gray-700 cursor-pointer" title="Edit"><HiOutlinePencil /></button>
                      <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 cursor-pointer" title="Delete"><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
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
            Showing <span className="font-medium">{paginated.length}</span> of <span className="font-medium">{filtered.length}</span>
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

      {/* Schedule Picker Modal */}
      <Modal isOpen={schedulePickerOpen} onClose={() => setSchedulePickerOpen(false)} title="Pick date & time" size="lg">
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomCalendar selectedDate={scheduledDate} setSelectedDate={setScheduledDate} />
            <div>
              <div className="mb-3 text-sm text-gray-700 font-medium flex items-center gap-2">
                <HiOutlineClock /> Time
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectDropdown
                  label="Hour"
                  value={scheduledHour}
                  onChange={(v) => setScheduledHour(v)}
                  options={Array.from({ length: 24 }).map((_, i) => {
                    const hh = String(i).padStart(2, '0');
                    return { label: hh, value: hh };
                  })}
                />
                <SelectDropdown
                  label="Minute"
                  value={scheduledMinute}
                  onChange={(v) => setScheduledMinute(v)}
                  options={Array.from({ length: 60 }).map((_, i) => {
                    const mm = String(i).padStart(2, '0');
                    return { label: mm, value: mm };
                  })}
                />
              </div>
              <div className="mt-4 text-xs text-gray-500">
                {scheduledDate ? `Selected: ${scheduledDate.toLocaleDateString()} ${scheduledHour}:${scheduledMinute}` : 'Pick a date'}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className='py-2'>
          <ModalButton variant="secondary" onClick={() => setSchedulePickerOpen(false)}>Close</ModalButton>
          <ModalButton onClick={() => setSchedulePickerOpen(false)}>Save</ModalButton>
        </ModalFooter>
      </Modal>

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
    </div>
  );
}

export const Route = createFileRoute('/dashboard/announcements/')({
  component: AnnouncementsPage,
});
