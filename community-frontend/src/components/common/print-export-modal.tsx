import React, { useMemo, useRef, useState } from 'react';
import ExportFilterModal from './export-filter-modal';
import { useReactToPrint } from 'react-to-print';

type ColumnMeta = { key: string; label?: string; default?: boolean };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  excelData?: any[];
  excelHeaderFormatter?: (key: string) => string;
  columns?: ColumnMeta[];
  title?: string;
}

// Printable content component (HTML/Tailwind), mirroring export-pdf-datas structure
const PrintableTable = React.forwardRef<HTMLDivElement, {
  data: any[];
  keys: string[];
  headerFormatter: (key: string) => string;
  title?: string;
}>(function PrintableTable({ data, keys, headerFormatter, title }, ref) {
  const nowStr = useMemo(() => new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), []);
  const tooManyCols = keys.length > 6;
  return (
    <div ref={ref} className="p-5 text-[10px] font-sans text-gray-700">
      {/* Header */}
      <div className="mb-4 pb-3 border-b-2 border-gray-200">
        <div className="flex items-start justify-between gap-3 mb-2">
          <img src="/logo.png" alt="logo" className="w-12 h-12 object-contain" />
          <div className="flex-1 ml-3">
            <div className="text-[16px] font-bold text-gray-800">RICH CLS</div>
            <div className="text-[8px] text-gray-500">Address: 332M+24C, KN 14 Ave, Kigali</div>
            <div className="text-[8px] text-gray-500">Phone: 0784 390 384</div>
            <div className="text-[8px] text-gray-500">Email: richrwanda@gmail.com</div>
          </div>
        </div>
        <div className="text-[14px] font-bold text-center text-gray-800">{title ?? 'Export'} Report</div>
        <div className="text-[9px] text-center text-gray-500">Generated on {nowStr}</div>
      </div>

      {/* Table */}
      <div className="w-full overflow-hidden">
        <table className={`w-full table-fixed border border-gray-200 ${tooManyCols ? 'print:landscape' : ''}`}> 
          <thead className="bg-gray-50">
            <tr>
              {keys.map((k) => (
                <th key={k} className="border border-gray-200 text-left p-1 align-top">
                  <div className="text-[8px] font-bold text-gray-700 truncate">{headerFormatter(k)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="break-inside-avoid">
                {keys.map((k) => {
                  const v = row[k];
                  const val = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
                  return (
                    <td key={k} className="border border-gray-200 p-1 align-top">
                      <div className="text-[7px] text-gray-600 whitespace-pre-wrap break-words">{val}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 text-center text-[7px] text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} RICH CLS. All rights reserved.
      </div>
    </div>
  );
});

const PrintExportModal: React.FC<Props> = ({ isOpen, onClose, excelData, excelHeaderFormatter, columns, title }) => {
  const [printPayload, setPrintPayload] = useState<{ rows: any[]; keys: string[] } | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const defaultHeaderFormatter = (key: string) => key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
  const formatHeader = excelHeaderFormatter ?? defaultHeaderFormatter;

  // Compute minDate from data.createdAt
  const minDate = useMemo(() => {
    if (!excelData || excelData.length === 0) return null;
    const dates = excelData
      .map((d) => (d?.createdAt ? new Date(d.createdAt) : null))
      .filter((d): d is Date => !!d && !isNaN(d.getTime()));
    if (dates.length === 0) return null;
    return new Date(Math.min(...dates.map((d) => d.getTime())));
  }, [excelData]);

  const handleConfirm = async ({ start, end, selectedColumns }: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => {
    if (!excelData || excelData.length === 0) {
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
    const keys = Object.keys(first).filter(k => !selectedColumns || selectedColumns.includes(k));
    setPrintPayload({ rows, keys });

    // Next tick, trigger print
    setTimeout(() => {
      handlePrint();
    }, 0);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${title ?? 'Export'} Report`,
    onAfterPrint: () => {
      setPrintPayload(null);
      onClose();
    },
  });

  return (
    <>
      {/* Hidden printable content */}
      {printPayload && (
        <div style={{ position: 'fixed', top: -9999, left: -9999 }}>
          <PrintableTable
            ref={componentRef}
            data={printPayload.rows}
            keys={printPayload.keys}
            headerFormatter={formatHeader}
            title={title}
          />
        </div>
      )}

      <ExportFilterModal
        isOpen={isOpen}
        onClose={onClose}
        exportType="print"
        onConfirm={handleConfirm}
        columns={columns}
        minDate={minDate}
      />
    </>
  );
};

export default PrintExportModal;

