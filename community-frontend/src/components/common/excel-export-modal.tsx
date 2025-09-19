import React from 'react';
import ExportFilterModal from './export-filter-modal';

type ColumnMeta = { key: string; label?: string; default?: boolean };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel?: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  excelData?: any[];
  excelFileName?: string;
  excelColumnWidths?: Record<string, number> | number[];
  excelHeaderFormatter?: (key: string) => string;
  columns?: ColumnMeta[];
}

const ExcelExportModal: React.FC<Props> = ({ isOpen, onClose, onExportExcel, excelData, excelFileName = 'export', excelColumnWidths, excelHeaderFormatter, columns }) => {
  const handleConfirmExcel = async ({ start, end, selectedColumns }: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => {
    if (onExportExcel) {
      return onExportExcel({ start, end, selectedColumns });
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

    // apply selected columns
    const keys = Object.keys(first).filter(k => !selectedColumns || selectedColumns.includes(k));

    try {
      const ExcelJS = await import('exceljs');
      const FileSaver = await import('file-saver');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Data');

      const widthByIndex = Array.isArray(excelColumnWidths) ? excelColumnWidths : undefined;
      const widthByKey: Record<string, number> | undefined = !Array.isArray(excelColumnWidths) ? excelColumnWidths as Record<string, number> | undefined : undefined;

      const columnsDef = keys.map((key, idx) => ({
        header: formatHeader(key),
        key,
        width: widthByIndex?.[idx] ?? widthByKey?.[key] ?? 15,
      }));
      worksheet.columns = columnsDef as any;

      // Header/info rows
      const companyRow1 = worksheet.addRow(['RICH CLS']);
      worksheet.addRow(['Address: 332M+24C, KN 14 Ave, Kigali']);
      worksheet.addRow(['Phone: 0784 390 384']);
      worksheet.addRow(['Email: richrwanda@gmail.com']);
      worksheet.addRow([]);
      const titleRow = worksheet.addRow([`Export Report`]);
      const dateRow = worksheet.addRow([`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`]);
      worksheet.addRow([]);

      const colCount = keys.length;
      worksheet.mergeCells(1, 1, 1, colCount);
      worksheet.mergeCells(2, 1, 2, colCount);
      worksheet.mergeCells(3, 1, 3, colCount);
      worksheet.mergeCells(4, 1, 4, colCount);
      worksheet.mergeCells(5, 1, 5, colCount);
      worksheet.mergeCells(6, 1, 6, colCount);
      worksheet.mergeCells(7, 1, 7, colCount);
      worksheet.mergeCells(8, 1, 8, colCount);

      companyRow1.font = { bold: true, size: 16 };
      companyRow1.alignment = { horizontal: 'left' };
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { horizontal: 'center' };
      dateRow.font = { italic: true, size: 10 };
      dateRow.alignment = { horizontal: 'center' };
      worksheet.getRow(8).alignment = { horizontal: 'center' };

      // Table header
      const headerRow = worksheet.addRow(keys.map(k => formatHeader(k)));
      headerRow.font = { bold: true };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };

      rows.forEach(item => {
        const plain: Record<string, any> = {};
        keys.forEach((k) => {
          const v = (item as any)[k];
          if (v === null || v === undefined) plain[k] = '';
          else if (typeof v === 'object') plain[k] = JSON.stringify(v);
          else plain[k] = v;
        });
        worksheet.addRow(plain);
      });

      worksheet.columns?.forEach((col: any) => {
        if (!col.width) {
          let max = String(col.header ?? '').length;
          col.eachCell?.({ includeEmpty: true }, (cell: any) => {
            const val = cell?.value ?? '';
            const len = String(val).length;
            if (len > max) max = len;
          });
          col.width = Math.min(Math.max(max + 2, 10), 60);
        }
      });

      worksheet.getCell('A1').value = null;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      FileSaver.saveAs(blob, `${excelFileName}.xlsx`);
    } catch (e) {
      console.error('Excel export failed', e);
    }
  };

  return (
    <ExportFilterModal
      isOpen={isOpen}
      onClose={onClose}
      exportType="excel"
      onConfirm={handleConfirmExcel}
      columns={columns}
    />
  );
};

export default ExcelExportModal;

