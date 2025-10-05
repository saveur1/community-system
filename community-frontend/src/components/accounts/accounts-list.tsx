import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FaSort, FaSortUp, FaSortDown, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaEye, FaTrash, FaEllipsisV, FaUserCog } from 'react-icons/fa';
import type { Account, AccountFilters } from '@/types/account';
import { SelectDropdown } from '@/components/ui/select';
import Modal, { ModalBody, ModalFooter, ModalButton } from '@/components/ui/modal';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import { spacer } from '@/utility/logicFunctions';
import { useVerifyAndUnverify, useActivateAndDeactivate } from '@/hooks/useUsers';
import { useRolesList } from '@/hooks/useRoles';
import { toast } from 'react-toastify';
import { ChangeRoleModal } from './change-role-modal';

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
  viewMode: ViewMode;
  filters: AccountFilters;
  setFilters: React.Dispatch<React.SetStateAction<AccountFilters>>;
  onDeleteAccount?: (account: Account) => void; // optional callback
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
  loading,
  viewMode,
  filters,
  setFilters,
  onDeleteAccount,
}: AccountsListProps) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Account; direction: 'asc' | 'desc' }>(
    { key: 'name', direction: 'asc' }
  );
  const { data: rolesData } = useRolesList({ category: title === 'All Accounts' ? undefined : title });
  const roles = rolesData?.result ?? [];

  // Delete Modal state
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Delete Modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  // Change Role Modal state
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [roleChangeAccount, setRoleChangeAccount] = useState<Account | null>(null);

  // Mutations for status changes
  const { mutate: verifyToggleMutate } = useVerifyAndUnverify();
  const { mutate: activeToggleMutate } = useActivateAndDeactivate();

  const handleVerifyToggle = (account: Account) => {
    const targetStatus = account.status === 'active' ? 'pending' : 'active';
    verifyToggleMutate({ userId: String(account.id), targetStatus });
  };

  const handleActiveToggle = (account: Account) => {
    const targetStatus = account.status === 'inactive' ? 'active' : 'inactive';
    activeToggleMutate({ userId: String(account.id), targetStatus });
  };

  const handleSort = (key: keyof Account) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openView = (account: Account) => {
    navigate({ to: '/dashboard/accounts/$account-id', params: { 'account-id': String(account.id) } });
  };

  const openDelete = (account: Account) => {
    setSelectedAccount(account);
    setDeleteInput('');
    setIsDeleteOpen(true);
  };

  const openChangeRole = (account: Account) => {
    setRoleChangeAccount(account);
    setIsChangeRoleOpen(true);
  };

  const closeChangeRole = () => {
    setIsChangeRoleOpen(false);
    setRoleChangeAccount(null);
  };

  const confirmDelete = () => {

    if (!selectedAccount) {
      toast.error('Something Went Wrong, please contact support!');
      return;
    };

    if (deleteInput !== selectedAccount.name) return; // simple guard; button disabled too
    onDeleteAccount?.(selectedAccount);
    setIsDeleteOpen(false);
    setSelectedAccount(null);
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
    return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading {title}...</div>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-3 lg:p-4 mb-4 lg:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Role</label>
            <SelectDropdown
              options={[
                { label: 'All Roles', value: 'all' },
                ...roles.map((role) => ({ label: spacer(role.name), value: role.name }))
              ]}
              value={filters.role || 'all'}
              onChange={(value) => {
                const newFilters = { ...filters, role: value === 'all' ? undefined : value };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              placeholder="Select a role"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
            <SelectDropdown
              options={[
                { label: 'All', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
              ]}
              value={filters.status}
              onChange={(value) => {
                const newFilters = { ...filters, status: value === 'all' ? undefined : (value as any) };
                setFilters(newFilters);
                onSearch(newFilters);
              }}
              placeholder="All Statuses"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              disabled
              className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-2 px-3 lg:px-4 rounded-md cursor-not-allowed text-sm lg:text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 overflow-x-auto">
          {sortedAccounts.length === 0 ? (
            <div className="p-10 text-center text-gray-600 dark:text-gray-300">No data available</div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-white dark:bg-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer sm:px-6 sm:py-3"
                    onClick={() => handleSort('name')}
                  >
                    Name {renderSortIcon('name')}
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    Email {renderSortIcon('email')}
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('phone')}
                  >
                    Phone {renderSortIcon('phone')}
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    Role {renderSortIcon('role')}
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    Status {renderSortIcon('status')}
                  </th>
                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sm:px-6 sm:py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {sortedAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 py-3 whitespace-nowrap sm:px-6 sm:py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          {account.profile ? (
                            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" src={account.profile} alt={account.name} />
                          ) : (
                            <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-300" />
                          )}
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{account.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate sm:block">{account.address}</div>
                          {/* Show hidden info on mobile */}
                          <div className="lg:hidden mt-1 space-y-1">
                            {account.email && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Email: {account.email}</div>
                            )}
                            {account.phone && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">Phone: {account.phone}</div>
                            )}
                            <div className="md:hidden">
                              <span className="inline-flex px-2 py-1 text-xs leading-4 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 capitalize">
                                {spacer(account.role)}
                              </span>
                            </div>
                            <div className="md:hidden mt-1">
                              <span className={`inline-flex px-2 py-1 text-xs leading-4 font-semibold rounded-full ${
                                account.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  : account.status === 'inactive'
                                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                    : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              }`}>
                                {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{account.email || 'N/A'}</div>
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{account.phone}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 capitalize">
                        {spacer(account.role)}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        account.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : account.status === 'inactive'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium sm:px-6 sm:py-4">
                      <div className="flex justify-end items-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          className="text-primary dark:text-primary-400 hover:text-primary/80 dark:hover:text-primary-300 p-1"
                          title="View"
                          onClick={(e) => { e.stopPropagation(); openView(account); }}
                        >
                          <FaEye className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <CustomDropdown
                          trigger={
                            <button
                              type="button"
                              className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-1"
                              title="More actions"
                            >
                              <FaEllipsisV className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                          }
                          position="bottom-right"
                          dropdownClassName="w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 py-1"
                          portal={true}
                        >
                          <DropdownItem
                            onClick={() => { handleVerifyToggle(account); }}
                            icon={<span className={`inline-block w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-yellow-500' : 'bg-green-500'}`} />}
                          >
                            {account.status === 'active' ? 'Unverify user' : 'Verify user'}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => { handleActiveToggle(account); }}
                            icon={<span className={`inline-block w-2 h-2 rounded-full ${account.status === 'inactive' ? 'bg-green-500' : 'bg-red-500'}`} />}
                          >
                            {account.status === 'inactive' ? 'Activate user' : 'Deactivate user'}
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => { openChangeRole(account); }}
                            icon={<FaUserCog className="text-blue-600 dark:text-blue-400" />}
                          >
                            Change role
                          </DropdownItem>
                          <DropdownItem
                            onClick={() => { openDelete(account); }}
                            icon={<FaTrash className="text-red-600 dark:text-red-400" />}
                            destructive
                          >
                            Delete user
                          </DropdownItem>
                        </CustomDropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-primary dark:bg-primary/50 border-primary dark:border-primary text-white dark:text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <span className="sr-only">Next</span>
                    <FaChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">Rows per page:</span>
                <div className="min-w-24">
                  <SelectDropdown
                    options={[
                      { label: '5', value: '5' },
                      { label: '10', value: '10' },
                      { label: '25', value: '25' },
                      { label: '50', value: '50' },
                    ]}
                    value={String(pageSize)}
                    onChange={(value) => onPageSizeChange(Number(value))}
                    dropdownClassName='w-32'
                    portal={ true }
                  />
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>
      ) : (
        sortedAccounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 p-10 text-center text-gray-600 dark:text-gray-300">No data available</div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {sortedAccounts.map((account) => (
            <div key={account.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-visible border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
              <div className="p-4 lg:p-6">
                <div className="flex items-center space-x-3 lg:space-x-4 mb-3 lg:mb-4">
                  <div className="flex-shrink-0 h-12 w-12 lg:h-16 lg:w-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                    {account.profile ? (
                      <img className="h-12 w-12 lg:h-16 lg:w-16 rounded-full" src={account.profile} alt={account.name} />
                    ) : (
                      <FaUser className="h-6 w-6 lg:h-8 lg:w-8 text-gray-400 dark:text-gray-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base lg:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">{account.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{account.role}</p>
                    <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : account.status === 'inactive'
                          ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {account.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                      <a href={`mailto:${account.email}`} className="hover:text-primary-600 dark:hover:text-primary-400 hover:underline truncate">
                        {account.email}
                      </a>
                    </div>
                  )}
                  {account.phone && (
                    <div className="flex items-center">
                      <FaPhone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-300 mr-2 flex-shrink-0" />
                      <a href={`tel:${account.phone}`} className="hover:text-primary-600 dark:hover:text-primary-400 truncate">
                        {account.phone}
                      </a>
                    </div>
                  )}
                  {account.address && (
                    <div className="flex items-start">
                      <FaMapMarkerAlt className="h-3 w-3 lg:h-4 lg:w-4 text-gray-400 dark:text-gray-300 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{account.address}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                  <span className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    account.status === 'active'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : account.status === 'inactive'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                  }`}>
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                  </span>
                  <div className="flex items-center gap-1 lg:gap-2">
                    <button
                      type="button"
                      className="text-primary dark:text-primary-400 hover:text-primary/80 dark:hover:text-primary-300 p-1"
                      title="View"
                      onClick={(e) => { e.stopPropagation(); openView(account); }}
                    >
                      <FaEye className="h-4 w-4 lg:h-5 lg:w-5" />
                    </button>
                    <CustomDropdown
                      trigger={
                        <button
                          type="button"
                          className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-1"
                          title="More actions"
                        >
                          <FaEllipsisV className="h-4 w-4 lg:h-5 lg:w-5" />
                        </button>
                      }
                      position="bottom-right"
                      dropdownClassName="min-w-44 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 dark:ring-gray-600 py-1"
                    >
                      <DropdownItem
                        onClick={() => { handleVerifyToggle(account); }}
                        icon={<span className={`inline-block w-2 h-2 rounded-full ${account.status === 'active' ? 'bg-yellow-500' : 'bg-green-500'}`} />}
                      >
                        {account.status === 'active' ? 'Unverify user' : 'Verify user'}
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => { handleActiveToggle(account); }}
                        icon={<span className={`inline-block w-2 h-2 rounded-full ${account.status === 'inactive' ? 'bg-green-500' : 'bg-red-500'}`} />}
                      >
                        {account.status === 'inactive' ? 'Activate user' : 'Deactivate user'}
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => { openChangeRole(account); }}
                        icon={<FaUserCog className="text-blue-600 dark:text-blue-400" />}
                      >
                        Change role
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => { openDelete(account); }}
                        icon={<FaTrash className="text-red-600 dark:text-red-400" />}
                        destructive
                      >
                        Delete user
                      </DropdownItem>
                    </CustomDropdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete user" size="md">
        <ModalBody>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              You are about to delete this user. This action is irreversible and <strong>all related user information will be deleted</strong>.
            </p>
            {selectedAccount && (
              <p>
                To confirm, type the user's name: <span className="font-semibold">{selectedAccount.name}</span>
              </p>
            )}
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              placeholder="Type the user's name to confirm"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setIsDeleteOpen(false)}>Cancel</ModalButton>
          <ModalButton
            variant="danger"
            onClick={confirmDelete}
            disabled={!selectedAccount || deleteInput !== selectedAccount.name}
          >
            Delete User
          </ModalButton>
        </ModalFooter>
      </Modal>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isChangeRoleOpen}
        onClose={closeChangeRole}
        account={roleChangeAccount}
      />
    </div>
  );
}