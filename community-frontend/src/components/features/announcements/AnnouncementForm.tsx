import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useRolesList } from '@/hooks/useRoles';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import CustomCalendar from '@/components/ui/calendar';
import { SelectDropdown } from '@/components/ui/select';
import type { Announcement } from '@/routes/dashboard/announcements';
import { toast } from 'react-toastify';

interface Props {
  onSubmit: (data: Partial<Announcement>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  title?: string;
  message?: string;
  status?: string;
  scheduledAt?: string | null;
  allowedRoles?: string[];
  viewDetailsLink?: string;
}

export const AnnouncementForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
  title: initialTitle = '',
  message: initialMessage = '',
  scheduledAt: initialScheduledAt = null,
  allowedRoles: initialAllowedRoles = [],
  viewDetailsLink: initialViewDetailsLink = '',
}: Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState(initialTitle);
  const [message, setMessage] = useState(initialMessage);
  const [schedule, setSchedule] = useState(!!initialScheduledAt);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(
    initialScheduledAt ? new Date(initialScheduledAt) : null
  );
  const [scheduledHour, setScheduledHour] = useState<string>(
    initialScheduledAt ? String(new Date(initialScheduledAt).getHours()).padStart(2, '0') : '09'
  );
  const [scheduledMinute, setScheduledMinute] = useState<string>(
    initialScheduledAt ? String(new Date(initialScheduledAt).getMinutes()).padStart(2, '0') : '00'
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialAllowedRoles ?? []);
  const [viewDetailsLink, setViewDetailsLink] = useState(initialViewDetailsLink ?? '');
  const [schedulePickerOpen, setSchedulePickerOpen] = useState(false);

  // Fetch roles for step 2
  const { data: rolesData, isLoading: rolesLoading } = useRolesList({ page: 1, limit: 200 });

  const roleGroups = useMemo(() => {
    const list = rolesData?.result ?? [];
    const toLabel = (name: string) =>
      name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const map = new Map<string, { title: string; options: { value: string; label: string }[] }>();
    for (const r of list) {
      const cat = r.category?.trim() || 'Other';
      if (!map.has(cat)) {
        map.set(cat, { title: cat, options: [] });
      }
      map.get(cat)!.options.push({ value: r.id, label: toLabel(r.name) });
    }
    return Array.from(map.values()).map(g => ({ title: g.title, options: g.options.sort((a, b) => a.label.localeCompare(b.label)) }));
  }, [rolesData]);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleGroupRoles = (roleValues: string[], selectAll: boolean) => {
    setSelectedRoles(prev => {
      const set = new Set(prev);
      if (selectAll) {
        roleValues.forEach(v => set.add(v));
      } else {
        roleValues.forEach(v => set.delete(v));
      }
      return Array.from(set);
    });
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!title.trim()) { toast.error('Title is required'); return false; }
      if (!message.trim()) { toast.error('Message is required'); return false; }
      if (schedule && !scheduledDate) { toast.error('Please set schedule date'); return false; }
    }
    if (step === 2) {
      if (selectedRoles.length === 0) { toast.error('Select at least one role'); return false; }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateStep(2)) return;

    const now = new Date();
    let scheduledAt: string | undefined = undefined;
    
    if (schedule && scheduledDate) {
      const d = new Date(scheduledDate);
      d.setHours(parseInt(scheduledHour), parseInt(scheduledMinute));
      if (d > now) scheduledAt = d.toISOString();
    }

    onSubmit({
      title: title.trim(),
      message: message.trim(),
      status: schedule && scheduledAt ? 'scheduled' : 'sent',
      scheduledAt,
      allowedRoles: selectedRoles,
      viewDetailsLink: viewDetailsLink.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6 max-sm:px-4">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of 2
          </span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 ? 'Announcement Details' : 'Select Recipients'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" 
               style={{ width: `${(currentStep / 2) * 100}%` }} />
        </div>
      </div>

      {currentStep === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full outline-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter announcement title"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full outline-none px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary resize-none"
              placeholder="Enter announcement message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Details Link (Optional)</label>
            <input
              type="url"
              value={viewDetailsLink}
              onChange={(e) => setViewDetailsLink(e.target.value)}
              className="w-full px-4 outline-none py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="Enter URL for more details"
            />
            <p className="mt-1 text-xs text-gray-500">Add a link where users can find more information</p>
          </div>

          <div className="mt-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Schedule for later</span>
            </label>
          </div>

          {schedule && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex gap-3 items-center w-full">
                <button
                  type="button"
                  onClick={() => setSchedulePickerOpen(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md w-full bg-white hover:bg-gray-50 text-left"
                >
                  {scheduledDate ? 
                    `${scheduledDate.toLocaleDateString()} ${scheduledHour}:${scheduledMinute}` : 
                    'Pick date and time'
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {rolesLoading ? (
            <div className="text-center py-4">Loading roles...</div>
          ) : (
            roleGroups.map(group => (
              <div key={group.title} className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{group.title}</h4>
                  {(() => {
                    const groupValues = group.options.map(o => o.value);
                    const allSelected = groupValues.every(v => selectedRoles.includes(v));
                    return (
                      <button
                        type="button"
                        onClick={() => toggleGroupRoles(groupValues, !allSelected)}
                        className={`text-xs px-2 py-1 rounded border border-gray-300 transition-colors ${
                          allSelected 
                            ? 'text-red-600 border border-gray-300-red-300 hover:bg-red-50' 
                            : 'text-primary border border-gray-300-primary/40 hover:bg-primary/5'
                        }`}
                      >
                        {allSelected ? 'Clear all' : 'Select all'}
                      </button>
                    );
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {group.options.map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(option.value)}
                        onChange={() => handleRoleToggle(option.value)}
                        className="h-4 w-4 text-primary rounded border border-gray-300-gray-300"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Schedule Picker Modal */}
      <Modal 
        isOpen={schedulePickerOpen} 
        onClose={() => setSchedulePickerOpen(false)} 
        title="Schedule Announcement" 
        size="lg"
      >
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomCalendar 
              selectedDate={scheduledDate} 
              setSelectedDate={setScheduledDate}
            />
            <div>
              <div className="mb-3 text-sm text-gray-700 font-medium">Time</div>
              <div className="grid grid-cols-2 gap-4">
                <SelectDropdown
                  label="Hour"
                  value={scheduledHour}
                  onChange={(v) => setScheduledHour(v)}
                  options={Array.from({ length: 24 }).map((_, i) => ({ 
                    label: String(i).padStart(2,'0'), 
                    value: String(i).padStart(2,'0') 
                  }))}
                />
                <SelectDropdown
                  label="Minute"
                  value={scheduledMinute}
                  onChange={(v) => setScheduledMinute(v)}
                  options={Array.from({ length: 60 }).map((_, i) => ({ 
                    label: String(i).padStart(2,'0'), 
                    value: String(i).padStart(2,'0') 
                  }))}
                />
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setSchedulePickerOpen(false)}>
            Cancel
          </ModalButton>
          <ModalButton onClick={() => setSchedulePickerOpen(false)}>
            Confirm
          </ModalButton>
        </ModalFooter>
      </Modal>

      <div className="flex justify-between mt-6 pt-6 border-t border-gray-300">
        {currentStep === 1 ? (
          <>
            <button onClick={onCancel} className="text-gray-600 hover:text-gray-800">
              Cancel
            </button>
            <button
              onClick={() => validateStep(1) && setCurrentStep(2)}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Next <FiChevronRight className="inline ml-1" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FiChevronLeft className="inline mr-1" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Announcement'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
