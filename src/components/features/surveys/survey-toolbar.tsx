import { FaList, FaTh } from 'react-icons/fa';
import { Link, useLocation } from '@tanstack/react-router';
import useAuth from '@/hooks/useAuth';

interface SurveyToolbarProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  search: string;
  setSearch: (value: string) => void;
  filteredCount: number;
}

export const SurveyToolbar = ({
  viewMode,
  setViewMode,
  search,
  setSearch,
  filteredCount,
}: SurveyToolbarProps) => {
  const { pathname } = useLocation();
  const dashboard = pathname.split('/')[1];
  const { user } = useAuth();

  return (
    <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-600 mr-2">Surveys</h2>
        <span className="text-gray-500 text-lg">({filteredCount})</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search surveys..."
          className="hidden md:block border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="flex items-center bg-white rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <FaList className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            <FaTh className="w-4 h-4" />
          </button>
        </div>
        {/* Create Survey Permission */}
        {user?.roles[0]?.permissions?.some((permission) => permission.name === 'survey:create') && (
          <Link to="/dashboard/surveys/add-new" className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2">
            <span className="text-lg">+</span>
            Create Survey Form
          </Link>
        )}
      </div>
    </div>
  );
};
