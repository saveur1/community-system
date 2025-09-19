import React from 'react';
import ExportFilterModal from './export-filter-modal';

type ColumnMeta = { key: string; label?: string; default?: boolean };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportCsv?: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  excelData?: any[];
  excelFileName?: string;
  excelHeaderFormatter?: (key: string) => string;
  columns?: ColumnMeta[];
}

const CsvExportModal: React.FC<Props> = ({ isOpen, onClose, onExportCsv, excelData, excelFileName = 'export', excelHeaderFormatter, columns }) => {
  const handleConfirmCsv = async ({ start, end, selectedColumns }: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => {
    if (onExportCsv) {
      return onExportCsv({ start, end, selectedColumns });
    }

    if (!excelData || !Array.isArray(excelData) || excelData.length === 0) {
      onClose();
      return;
    }

    const withinRange = (d: any) => {
      const createdAt = d?.createdAt ? new Date(d.createdAt) : null;
      if (!createdAt) return true;
      if (start && createdAt < start) return false;
      if (end) {
        const endAdj = new Date(end);
        endAdj.setSeconds(59, 999);
        if (createdAt > endAdj) return false;
      }
      return true;
    };

    const rows = excelData.filter(withinRange);
    if (rows.length === 0) {
      onClose();
      return;
    }

    const first = rows[0];
    const defaultHeaderFormatter = (key: string) => key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
    const formatHeader = excelHeaderFormatter ?? defaultHeaderFormatter;

    const keys = Object.keys(first).filter(k => !selectedColumns || selectedColumns.includes(k));

    // Build CSV
    let csvContent = '';
    const headers = keys.map(key => formatHeader(key));
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\n';
    rows.forEach(item => {
      const vals = keys.map(k => {
        const v = (item as any)[k];
        if (v === null || v === undefined) return '';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      });
      csvContent += vals.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const FileSaver = await import('file-saver');
    FileSaver.saveAs(blob, `${excelFileName}.csv`);
  };

  return (
    <ExportFilterModal
      isOpen={isOpen}
      onClose={onClose}
      exportType="csv"
      onConfirm={handleConfirmCsv}
      columns={columns}
    />
  );
};

export default CsvExportModal;

