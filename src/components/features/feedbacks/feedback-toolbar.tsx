import { FaList, FaPlus, FaTh, FaSearch } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

interface FeedbackToolbarProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  search: string;
  setSearch: (value: string) => void;
  filteredCount: number;
}

export const FeedbackToolbar = ({
  viewMode,
  setViewMode,
  search,
  setSearch,
  filteredCount,
}: FeedbackToolbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false); // State for mobile search toggle

  return (
    <div className="flex flex-col sm:flex-row w-full bg-white px-4 max-sm:px-2 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
      {/* Header and count */}
      <div className="flex items-center w-full sm:w-auto">
        <h2 className="text-xl font-bold text-gray-600 mr-2 max-sm:mr-1 max-sm:text-sm">Feedbacks</h2>
        <span className="text-gray-500 text-lg max-sm:text-sm">({filteredCount})</span>
      </div>

      {/* Search bar: Hidden on mobile, toggled by icon */}
      <div className="flex-1 w-full sm:w-auto mt-2 sm:mt-0 ml-3">
        <div className="relative w-full">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search feedbacks..."
            className={`w-full max-w-lg border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
              isSearchOpen ? 'block' : 'hidden sm:block'
            }`}
          />
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden absolute top-1/2 -translate-y-1/2 right-2 text-gray-600 hover:text-gray-800"
          >
            <FaSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View mode and action buttons */}
      <div className="flex items-center gap-2 max-sm:gap-1 mt-2 sm:mt-0 sm:ml-3">
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 max-sm:p-1 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            title="List View"
          >
            <FaList className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 max-sm:p-1 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
            }`}
            title="Grid View"
          >
            <FaTh className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
          </button>
        </div>
        <Link
          to="/dashboard/feedback/add-new"
          className="bg-primary text-white px-4 max-sm:px-2 py-2 max-sm:py-1.5 rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm max-sm:text-xs flex items-center gap-1.5"
        >
          <FaPlus className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
          <span className="max-sm:text-xs">Make Feedback</span>
        </Link>
      </div>
    </div>
  );
};