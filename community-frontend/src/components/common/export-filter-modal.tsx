import React, { useEffect, useMemo, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import DateTimePicker from '@/components/ui/date-time';

type ExportType = 'excel' | 'csv' | 'pdf' | 'print';

type ColumnMeta = { key: string; label?: string; default?: boolean };

interface ExportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportType: ExportType;
  onConfirm: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  columns?: ColumnMeta[];
  minDate?: Date | null;
}

const ExportFilterModal: React.FC<ExportFilterModalProps> = ({ isOpen, onClose, exportType, onConfirm, columns = [], minDate = null }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startHour, setStartHour] = useState<string>('00');
  const [startMinute, setStartMinute] = useState<string>('00');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endHour, setEndHour] = useState<string>('23');
  const [endMinute, setEndMinute] = useState<string>('59');
  const [isStartPickerOpen, setIsStartPickerOpen] = useState<boolean>(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState<boolean>(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(() => (columns.length ? columns.map(c => c.key) : []));

  const title = useMemo(() => {
    const label = exportType.toUpperCase();
    return `Export to ${label}`;
  }, [exportType]);

  // Keep selected columns in sync with incoming columns/isOpen
  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(columns.length ? columns.map(c => c.key) : []);
    }
  }, [isOpen, columns]);

  const buildDate = (date: Date | null, hour: string, minute: string): Date | null => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(Number(hour), Number(minute), 0, 0);
    return d;
  };

  const handleConfirm = async () => {
    const start = buildDate(startDate, startHour, startMinute);
    const end = buildDate(endDate, endHour, endMinute);
    await onConfirm({ start, end, selectedColumns });
    onClose();
  };

  const reset = () => {
    setStartDate(null);
    setStartHour('00');
    setStartMinute('00');
    setEndDate(null);
    setEndHour('23');
    setEndMinute('59');
    setIsStartPickerOpen(false);
    setIsEndPickerOpen(false);
    setSelectedColumns([]);
  };

  const formatDateTime = (date: Date | null, hour: string, minute: string) => {
    if (!date) return 'Select Date & Time';
    const formattedDate = date.toISOString().split('T')[0];
    return `${formattedDate} ${hour}:${minute}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={title} size="xl">
      <ModalBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Start Date & Time</div>
            <DateTimePicker
              isOpen={isStartPickerOpen}
              onClose={() => setIsStartPickerOpen(false)}
              title="Start Date & Time"
              selectedDate={startDate}
              selectedHour={startHour}
              selectedMinute={startMinute}
              onDateChange={setStartDate}
              onHourChange={setStartHour}
              onMinuteChange={setStartMinute}
              minDate={minDate ?? undefined}
              trigger={
                <input
                  type="text"
                  readOnly
                  value={formatDateTime(startDate, startHour, startMinute)}
                  onClick={() => setIsStartPickerOpen(true)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  placeholder="Select Start Date & Time"
                />
              }
              embedded={false}
            />
          </div>
          <div>
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">End Date & Time</div>
            <DateTimePicker
              isOpen={isEndPickerOpen}
              onClose={() => setIsEndPickerOpen(false)}
              title="End Date & Time"
              selectedDate={endDate}
              selectedHour={endHour}
              selectedMinute={endMinute}
              onDateChange={setEndDate}
              onHourChange={setEndHour}
              onMinuteChange={setEndMinute}
              minDate={minDate ?? undefined}
              trigger={
                <input
                  type="text"
                  readOnly
                  value={formatDateTime(endDate, endHour, endMinute)}
                  onClick={() => setIsEndPickerOpen(true)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  placeholder="Select End Date & Time"
                />
              }
              embedded={false}
            />
          </div>
        </div>

        {columns.length > 0 && (
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Columns to export</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {columns.map((col) => {
                const id = `col-${col.key}`;
                const checked = selectedColumns.includes(col.key);
                return (
                  <label key={col.key} htmlFor={id} className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 rounded transition-colors">
                    <input
                      id={id}
                      type="checkbox"
                      className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedColumns((prev) => {
                          if (e.target.checked) return Array.from(new Set([...prev, col.key]));
                          return prev.filter((k) => k !== col.key);
                        });
                      }}
                    />
                    <span>{col.label ?? col.key}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <ModalButton variant="secondary" onClick={() => { reset(); onClose(); }}>
          Cancel
        </ModalButton>
        <ModalButton onClick={handleConfirm}>
          Continue
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
};

export default ExportFilterModal;