import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { toast } from 'react-toastify';
import { FiChevronLeft } from 'react-icons/fi';

const STORAGE_KEY = 'rapid_enquiries';

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const Route = createFileRoute('/dashboard/rapid-enquiry/add-new')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'sent'>('draft');

  const handleSave = () => {
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (!link.trim()) { toast.error('Link is required'); return; }

    const item = {
      id: generateId(),
      title: title.trim(),
      link: link.trim(),
      scheduledAt: scheduledAt || null,
      status,
      createdAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) as any[] : [];
      arr.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      toast.success('Rapid enquiry created');
      navigate({ to: '/dashboard/rapid-enquiry' });
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  return (
    <div className="pb-10">
      <Breadcrumb items={['Dashboard', 'Rapid Enquiry', 'Add New']} title="Add Rapid Enquiry" className="absolute top-0 left-0 w-full px-6" />

      <div className="pt-20 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Rapid Enquiry</h1>
            <p className="text-gray-600">Rapid enquiries are short prompts with a link and optional schedule.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Short title" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="https://..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled (optional)</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
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
              <FiChevronLeft /> Cancel
            </button>
            <div className="flex gap-3">
              <button onClick={() => { setTitle(''); setLink(''); setScheduledAt(''); setStatus('draft'); }} className="px-4 py-2 border rounded-md">Reset</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-md">Create Rapid Enquiry</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
