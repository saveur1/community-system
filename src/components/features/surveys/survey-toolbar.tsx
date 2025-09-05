import { FaList, FaPlus, FaTh } from 'react-icons/fa';
import { Link } from '@tanstack/react-router';
import useAuth from '@/hooks/useAuth';
import { checkPermissions } from '@/utility/logicFunctions';

interface SurveyToolbarProps {
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  search: string;
  setSearch: (value: string) => void;
  filteredCount: number;
  title: string;
  hideCreateButton?: boolean;
  createButtonLink?: string; // Optional custom link for the create button
}

export const SurveyToolbar = ({
  viewMode,
  setViewMode,
  search,
  setSearch,
  filteredCount,
  title,
  hideCreateButton,
  createButtonLink = "/dashboard/surveys/add-new"
}: SurveyToolbarProps) => {
  const { user } = useAuth();

  return (
    <div className="flex w-full bg-white px-4 py-2 my-6 border border-gray-300 rounded-md items-center mb-6">
      <div className="flex items-center">
        <h2 className="text-xl font-bold text-gray-600 mr-2">{title}</h2>
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
        {/* {checkPermissions(user, 'survey:create') && !hideCreateButton && ( */}
          <Link to={ createButtonLink } className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium shadow-sm flex items-center gap-2">
            <span className="text-lg"><FaPlus className="w-4 h-4" /></span>
            { title }
          </Link>
        {/* )} */}
      </div>
    </div>
  );
};
