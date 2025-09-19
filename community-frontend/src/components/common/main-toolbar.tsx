import { useState, type ReactNode } from 'react';
import { FaList, FaPlus, FaTh, FaSearch, FaFileCsv, FaFilePdf, FaPrint } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import ExcelExportModal from './excel-export-modal';
import CsvExportModal from './csv-export-modal';
import PdfExportModal from './pdf-export-modal';
import PrintExportModal from './print-export-modal';
import { FaX } from 'react-icons/fa6';

interface CreateButtonProps {
  to: string;
  label?: string;
  icon?: ReactNode;
  className?: string;
}

interface MainToolbarProps {
  title?: string;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  search: string;
  setSearch: (value: string) => void;
  filteredCount?: number;
  showCreate?: boolean;
  createButton?: CreateButtonProps;
  className?: string;
  onExportExcel?: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  onExportCsv?: (filters: { start: Date | null; end: Date | null; selectedColumns?: string[] }) => Promise<void>;
  onExportPdf?: (filters: { start: Date | null; end: Date | null }) => void;
  onPrint?: (filters: { start: Date | null; end: Date | null }) => void;
  excelData?: any[];
  excelFileName?: string;
  excelColumnWidths?: Record<string, number> | number[]; // map header->width or ordered widths
  excelHeaderFormatter?: (key: string) => string; // customize header labels
}

const MainToolbar = ({
  title = 'Items',
  viewMode,
  setViewMode,
  search,
  setSearch,
  filteredCount = 0,
  showCreate = true,
  createButton,
  className = '',
  onExportExcel,
  onExportCsv,
  onExportPdf,
  excelData,
  excelFileName = 'export',
  excelColumnWidths,
  excelHeaderFormatter,
}: MainToolbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [openExcel, setOpenExcel] = useState(false);
  const [openCsv, setOpenCsv] = useState(false);
  const [openPdf, setOpenPdf] = useState(false);
  const [openPrint, setOpenPrint] = useState(false);

  const createBtn = createButton ?? { to: '#', label: 'New', icon: <FaPlus />, className: '' };

  // Solution 1: Simplified approach - just set the type and open the modal
  const handleOpenModal = (type: 'excel' | 'csv' | 'pdf' | 'print') => {
    if (type === 'excel') setOpenExcel(true);
    if (type === 'csv') setOpenCsv(true);
    if (type === 'pdf') setOpenPdf(true);
    if (type === 'print') setOpenPrint(true);
  };

  // Build exportable columns meta from data
  const defaultHeaderFormatter = (key: string) => key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w|\s\w/g, (m) => m.toUpperCase());
  const formatHeader = excelHeaderFormatter ?? defaultHeaderFormatter;
  const columnKeys = Array.isArray(excelData) && excelData.length > 0 ? Object.keys(excelData[0]) : [];
  const exportColumns = columnKeys.map((k) => ({ key: k, label: formatHeader(k), default: true }));



  // CSV/Excel/PDF logic is delegated to respective modals

  return (
    <div className={`flex flex-col sm:flex-row sm:justify-between w-full bg-white px-4 max-sm:px-2 py-2 my-6 border border-gray-300 rounded-md items-center mb-6 ${className}`}>
      <div className="flex justify-between items-center sm:justifystart gap-x-3 w-full sm:w-2/3">
        <div className="flex items-center max-sm:max-w-24 w-auto">
          <h2 className="text-xl font-bold text-gray-600 mr-2 max-sm:mr-1 max-sm:text-sm">{title}</h2>
          <span className="text-gray-500 text-lg max-sm:text-sm">({filteredCount})</span>
        </div>

        <div className="flex-1 w-full sm:w-auto sm:mt-0 ml-3">
          <div className="max-md:relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className={`max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${isSearchOpen ? 'visible' : 'invisible sm:visible'}`}
            />
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden absolute top-1/2 -translate-y-1/2 right-2 text-gray-600 hover:text-gray-800"
              aria-label="toggle search"
            >
              {!isSearchOpen ? <FaSearch className="w-4 h-4" /> : <FaX className="w-4 h-4 text-red-500" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center max-md:flex-col justify-end gap-2 w-1/3 max-sm:w-full max-sm:justify-center max-sm:gap-1 mt-2 sm:mt-0 sm:ml-3">
        {/* Export buttons */}
        <div className="flex items-center gap-2 mr-2">
          <button
            type="button"
            onClick={() => handleOpenModal('excel')}
            className="flex items-center hover:bg-gray-100 gap-1.5 px-3 py-2.5 rounded-md bg-gray-200 text-success font-bold cursor-pointer border border-gray-300 transition-colors text-xs shadow-sm"
            title="Export to Excel"
          >
            <PiMicrosoftExcelLogoFill className="w-4 h-4 text-success" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal('csv')}
            className="flex items-center gap-1.5 hover:bg-gray-100 cursor-pointer px-3 py-2.5 rounded-md bg-gray-200 text-blue-600 font-bold border-gray-300 border transition-colors text-xs shadow-sm"
            title="Export to CSV"
          >
            <FaFileCsv className="w-4 h-4 text-blue-600" />
            <span>CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal('pdf')}
            className="flex items-center gap-1.5 px-3 py-2.5 hover:bg-gray-100 cursor-pointer rounded-md bg-gray-200 text-red-700 font-bold border-gray-300 border transition-colors text-xs shadow-sm"
            title="Export to PDF"
          >
            <FaFilePdf className="w-4 h-4 text-red-700" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal('print')}
            className="flex items-center gap-1.5 px-3 py-2.5 hover:bg-gray-100 cursor-pointer rounded-md bg-gray-200 text-title font-bold border-gray-300 border transition-colors text-xs shadow-sm"
            title="Print"
          >
            <FaPrint className="w-4 h-4 text-title" />
            <span>Print</span>
          </button>
        </div>

        <div className="flex items-center gap-2 max-md:mt-2">
          <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 max-sm:p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              title="List View"
            >
              <FaList className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 max-sm:p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              title="Grid View"
            >
              <FaTh className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
            </button>
          </div>

          {showCreate && (
            <Link
              to={createBtn.to}
              className={`bg-primary text-white px-4 min-w-46 max-sm:px-2 py-2 max-sm:py-1.5 rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm max-sm:text-xs flex items-center gap-1.5 ${createBtn?.className ?? ''}`}
            >
              {createBtn.icon ?? <FaPlus className="w-4 h-4 max-sm:w-3 max-sm:h-3" />}
              <span className="max-sm:text-xs">{createBtn.label}</span>
            </Link>
          )}
        </div>
      </div>

      <ExcelExportModal
        isOpen={openExcel}
        onClose={() => setOpenExcel(false)}
        onExportExcel={onExportExcel}
        excelData={excelData}
        excelFileName={excelFileName}
        excelColumnWidths={excelColumnWidths}
        excelHeaderFormatter={excelHeaderFormatter}
        columns={exportColumns}
      />
      <CsvExportModal
        isOpen={openCsv}
        onClose={() => setOpenCsv(false)}
        onExportCsv={onExportCsv}
        excelData={excelData}
        excelFileName={excelFileName}
        excelHeaderFormatter={excelHeaderFormatter}
        columns={exportColumns}
      />
      <PdfExportModal
        isOpen={openPdf}
        onClose={() => setOpenPdf(false)}
        onExportPdf={onExportPdf ? ((filters) => Promise.resolve(onExportPdf(filters))) : undefined}
        excelData={excelData}
        excelFileName={excelFileName}
        excelHeaderFormatter={excelHeaderFormatter}
        columns={exportColumns}
      />
      <PrintExportModal
        isOpen={openPrint}
        onClose={() => setOpenPrint(false)}
        excelData={excelData}
        excelHeaderFormatter={excelHeaderFormatter}
        columns={exportColumns}
        title={title}
      />
    </div>
  );
};

export default MainToolbar;