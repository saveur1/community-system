import React from 'react';
import ExportFilterModal from './export-filter-modal';
import { generatePDFReport } from './export-pdf-datas';

type ColumnMeta = { key: string; label?: string; default?: boolean };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportPdf?: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  excelData?: any[];
  excelFileName?: string;
  excelHeaderFormatter?: (key: string) => string;
  columns?: ColumnMeta[];
}

const PdfExportModal: React.FC<Props> = ({ isOpen, onClose, onExportPdf, excelData, excelFileName = 'export', excelHeaderFormatter, columns }) => {
  const handleConfirmPdf = async ({ start, end, selectedColumns }: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => {
    if (onExportPdf) {
      return onExportPdf({ start, end, selectedColumns });
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
    const filteredRows = rows.map(item => {
      const plain: Record<string, any> = {};
      keys.forEach(k => {
        const v = (item as any)[k];
        if (v === null || v === undefined) plain[k] = '';
        else if (typeof v === 'object') plain[k] = JSON.stringify(v);
        else plain[k] = v;
      });
      return plain;
    });

    await generatePDFReport({
      data: filteredRows,
      fileName: excelFileName,
      title: 'Export Report',
      headerFormatter: formatHeader,
    });
  };

  return (
    <ExportFilterModal
      isOpen={isOpen}
      onClose={onClose}
      exportType="pdf"
      onConfirm={handleConfirmPdf}
      columns={columns}
    />
  );
};

export default PdfExportModal;

