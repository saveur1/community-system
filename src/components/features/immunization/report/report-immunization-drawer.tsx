import { useState } from 'react';
import Drawer from '@/components/ui/drawer';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { FaTimes } from 'react-icons/fa';

interface ReportImmunizationDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ReportImmunizationDrawer: React.FC<ReportImmunizationDrawerProps> = ({ open, onClose }) => {
  const [availableTags, setAvailableTags] = useState<string[]>([
    'Health Center A',
    'Health Center B',
    'District Hospital',
    'Cell Leaders'
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState('');
  const [defectiveCount, setDefectiveCount] = useState<number | ''>('');
  const [confirmReceived, setConfirmReceived] = useState<number | ''>('');

  const addTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
    setAvailableTags((prev) => prev.filter((t) => t !== tag));
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
    setAvailableTags((prev) => [...prev, tag].sort());
  };

  const filteredOptions = availableTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()));

  const handleSave = () => {
    // Placeholder: here you could propagate selectedTags and defectiveCount upward via callbacks
    onClose();
  };

  return (
    <Drawer open={open} onClose={onClose} title="Report Immunization">
      <div className="p-4 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Who can see Report (Tag)</label>
          <CustomDropdown
            dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-80"
            position="bottom-left"
            closeOnClick={false}
            trigger={
              <div className="flex items-center flex-wrap gap-2 w-80 min-h-[38px] border border-gray-300 rounded-md px-2 py-1.5 text-sm bg-white">
                {selectedTags.length === 0 && (
                  <span className="text-gray-500">Select one or more…</span>
                )}
                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {tag}
                    <button
                      type="button"
                      className="text-blue-700/80 hover:text-blue-900"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTag(tag);
                      }}
                      title="Remove tag"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            }
          >
            {/* Search always visible and does not close dropdown */}
            <div className="px-1 pb-2">
              <input
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search…"
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            {/* Options list excludes already selected, stays open on click */}
            {filteredOptions.map((opt) => (
              <DropdownItem
                key={opt}
                onClick={(e) => {
                  e.stopPropagation();
                  addTag(opt);
                }}
              >
                {opt}
              </DropdownItem>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-xs text-gray-500">No matches</div>
            )}
          </CustomDropdown>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Received</label>
          <input
            type="number"
            min={0}
            value={confirmReceived}
            onChange={(e) => {
              const val = e.target.value;
              setConfirmReceived(val === '' ? '' : Number(val));
            }}
            className="w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter count"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">How many defective</label>
          <input
            type="number"
            min={0}
            value={defectiveCount}
            onChange={(e) => {
              const val = e.target.value;
              setDefectiveCount(val === '' ? '' : Number(val));
            }}
            className="w-80 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter count"
          />
        </div>

        <div className="pt-2">
          <button
            className="px-3 py-2 rounded-md bg-primary text-white text-sm"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </Drawer>
  );
};
