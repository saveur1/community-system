import React, { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { toast } from 'react-toastify';
import { FiChevronLeft } from 'react-icons/fi';

const STORAGE_KEY = 'rapid_enquiries';

export const Route = createFileRoute('/dashboard/rapid-enquiry/$edit-id')({
  component: RouteComponent,
  validate: (params) => ({ 'edit-id': String(params['edit-id'] ?? '') }),
});

function RouteComponent() {
  const navigate = useNavigate();
  const params = (Route as any).useParams?.() ?? {};
  const id = String(params['edit-id'] ?? '');
  const [item, setItem] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'sent'>('draft');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) { toast.error('Not found'); navigate({ to: '/dashboard/rapid-enquiry' }); return; }
      const arr = JSON.parse(raw) as any[];
      const found = arr.find((a) => String(a.id) === id);
      if (!found) { toast.error('Not found'); navigate({ to: '/dashboard/rapid-enquiry' }); return; }
      setItem(found);
      setTitle(found.title || '');
      setLink(found.link || '');
      setScheduledAt(found.scheduledAt || '');
      setStatus(found.status || 'draft');
    } catch {
      toast.error('Failed to load');
      navigate({ to: '/dashboard/rapid-enquiry' });
    }
  }, [id]);

  const handleUpdate = () => {
    if (!item) return;
    if (!title.trim()) { toast.error('Title required'); return; }
    if (!link.trim()) { toast.error('Link required'); return; }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) as any[] : [];
      const next = arr.map(a => a.id === item.id ? { ...a, title: title.trim(), link: link.trim(), scheduledAt: scheduledAt || null, status } : a);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      toast.success('Updated');
      navigate({ to: '/dashboard/rapid-enquiry' });
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = () => {
    if (!item) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) as any[] : [];
      const next = arr.filter(a => a.id !== item.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      toast.success('Deleted');
      navigate({ to: '/dashboard/rapid-enquiry' });
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (!item) return null;

  return (
    <div className="pb-10">
      <Breadcrumb items={['Dashboard', 'Rapid Enquiry', 'Edit']} title="Edit Rapid Enquiry" className="absolute top-0 left-0 w-full px-6" />
      <div className="pt-20 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Rapid Enquiry</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled (optional)</label>
              <input type="datetime-local" value={scheduledAt || ''} onChange={(e) => setScheduledAt(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button onClick={() => navigate({ to: '/dashboard/rapid-enquiry' })} className="px-4 py-2 rounded-md border flex items-center gap-2">
              <FiChevronLeft /> Back
            </button>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="px-4 py-2 border rounded-md text-red-600">Delete</button>
              <button onClick={handleUpdate} className="px-4 py-2 bg-primary text-white rounded-md">Save changes</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
