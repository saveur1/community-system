import { FaList, FaTh } from 'react-icons/fa';

interface ReportToolbarProps {
  viewMode: 'list' | 'grid';
  onViewModeChange: (mode: 'list' | 'grid') => void;
  search: string;
  onSearchChange: (search: string) => void;
  filteredCount: number;
  onReport?: () => void;
}

export const ReportToolbar = ({ viewMode, onViewModeChange, search, onSearchChange, filteredCount, onReport }: ReportToolbarProps) => {
  return (
    <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-600 mr-2">Immunization Reports</h2>
        <span className="text-gray-500 text-lg">({filteredCount})</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="hidden md:block border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center bg-white rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <FaList className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <FaTh className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={onReport}
          className="px-3 py-2 rounded-md bg-primary text-white text-sm hover:bg-blue-600 shadow-sm"
        >
          Report Immunization
        </button>
      </div>
    </div>
  );
};
