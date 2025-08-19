import { useState, useMemo } from 'react';
import { FaSearch, FaListUl, FaTh, FaSort, FaSortUp, FaSortDown, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEllipsisV, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Account, AccountFilters } from '@/types/account';

type ViewMode = 'list' | 'grid';

interface AccountsListProps {
  accounts: Account[];
  title: string;
  onSearch: (filters: AccountFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  loading: boolean;
}

export function AccountsList({
  accounts,
  title,
  onSearch,
  onPageChange,
  onPageSizeChange,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  loading
}: AccountsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AccountFilters>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof Account; direction: 'asc' | 'desc' }>(
    { key: 'name', direction: 'asc' }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ ...filters, search: searchTerm });
  };

  const handleSort = (key: keyof Account) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAccounts = useMemo(() => {
    const sortableItems = [...accounts];
    if (!sortConfig) return sortableItems;

    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [accounts, sortConfig]);

  const renderSortIcon = (key: keyof Account) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 opacity-30" />;
    return sortConfig.direction === 'asc'
      ? <FaSortUp className="inline ml-1" />
      : <FaSortDown className="inline ml-1" />;
  };

  if (loading) {
    return <div className="p-8 text-center">Loading {title}...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex-1 md:flex-none">
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>
          <div className="flex items-center bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
              title="List view"
            >
              <FaListUl />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-500'}`}
              title="Grid view"
            >
              <FaTh />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined })}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              className="w-full border rounded-md p-2 text-sm"
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
            >
              <option value="">All Types</option>
              <option value="community">Community</option>
              <option value="religious">Religious</option>
              <option value="stakeholder">Stakeholder</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => onSearch({ ...filters, search: searchTerm })}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('email')}
                  >
                    Email {renderSortIcon('email')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('phone')}
                  >
                    Phone {renderSortIcon('phone')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('role')}
                  >
                    Role {renderSortIcon('role')}
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('type')}
                  >
                    Type {renderSortIcon('type')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {account.profile ? (
                            <img className="h-10 w-10 rounded-full" src={account.profile} alt={account.name} />
                          ) : (
                            <FaUser className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{account.name}</div>
                          <div className="text-xs text-gray-500">{account.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{account.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {account.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {account.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FaChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                            ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Rows per page:</span>
                <select
                  className="border rounded p-1 text-sm"
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAccounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                    {account.profile ? (
                      <img className="h-16 w-16 rounded-full" src={account.profile} alt={account.name} />
                    ) : (
                      <FaUser className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">{account.role}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : account.status === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {account.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`mailto:${account.email}`} className="hover:text-primary-600 hover:underline">
                        {account.email}
                      </a>
                    </div>
                  )}
                  {account.phone && (
                    <div className="flex items-center">
                      <FaPhone className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={`tel:${account.phone}`} className="hover:text-primary-600">
                        {account.phone}
                      </a>
                    </div>
                  )}
                  {account.address && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{account.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {account.type}
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle menu toggle
                      }}
                    >
                      <FaEllipsisV className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
