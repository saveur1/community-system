import { useState, useEffect, useMemo } from 'react';
import { useUsersList } from '@/hooks/useUsers';
import { AccountsList } from '@/components/accounts/accounts-list';
import { createFileRoute } from '@tanstack/react-router';
import MainToolbar from '@/components/common/main-toolbar';
import { FaPlus } from 'react-icons/fa';
import type { Account, AccountFilters } from '@/types/account';
import type { User } from '@/api/auth';
import { spacer } from '@/utility/logicFunctions';
import OfflineIndicator from '@/components/common/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import Breadcrumb from '@/components/ui/breadcrum';

// Helper: determine account type by membership in signup user type groups
function mapUserTypeToAccountType(userType?: string): Account['type'] {
  if (!userType) return 'RICH Members';
  if (userType === 'Community Members') return 'Community Members';
  if (userType === 'Health service providers') return 'Health service providers';
  if (userType === 'Stakeholders') return 'Stakeholders';
  if (userType === 'RICH Members') return 'RICH Members';
  return 'RICH Members';
}

export const Route = createFileRoute('/dashboard/accounts/')({
  component: AccountsPage,
});

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filters, setFilters] = useState<AccountFilters>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const searchParams = Route.useSearch();
  const { isOnline } = useNetworkStatus();

  const { data, isLoading } = useUsersList({ 
    page: pagination.page, 
    limit: pagination.pageSize,
    search: filters.search 
  });

  useEffect(()=>{
    if((searchParams as any).status == "pending"){
      setFilters({
        ...filters,
        status: "pending"
      })
    }
  },[])

  const { data: exportData } = useUsersList({ limit:-1});

  // Export data formatter based on IUserAttributes
  const excelDataExported = (users: any[]) => {
    return users?.map((user, index) => ({
      id: index + 1,
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      status: user?.status || '',
      userType: user?.userType || '',
      district: user?.district || '',
      sector: user?.sector || '',
      cell: user?.cell || '',
      village: user?.village || '',
      preferredLanguage: user?.preferredLanguage || '',
      nearByHealthCenter: user?.nearByHealthCenter || '',
      schoolName: user?.schoolName || '',
      schoolAddress: user?.schoolAddress || '',
      churchName: user?.churchName || '',
      churchAddress: user?.churchAddress || '',
      hospitalName: user?.hospitalName || '',
      hospitalAddress: user?.hospitalAddress || '',
      healthCenterName: user?.healthCenterName || '',
      healthCenterAddress: user?.healthCenterAddress || '',
      epiDistrict: user?.epiDistrict || '',
      salary: user?.salary || '',
      profile: user?.profile || '',
      emailVerified: user?.emailVerified ? 'Yes' : 'No',
      roles: user?.roles?.map((role: any) => spacer(role.name)).join(', ') || '',
      createdAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      updatedAt: user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''
    }))
  };

  const mapped = useMemo(() => {
    const list: User[] = data?.result ?? [];
    let items: Account[] = list.map((u) => ({
      id: String(u.id),
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.roles?.[0]?.name || 'user',
      profile: u.profile,
      address: u.address,
      type: mapUserTypeToAccountType((u as any).userType),
      status: (u.status as any) || 'active',
      createdAt: (u as any).createdAt ? String((u as any).createdAt) : new Date().toISOString(),
      updatedAt: (u as any).updatedAt ? String((u as any).updatedAt) : new Date().toISOString(),
    }));

    // Apply remaining client-side filters (search is now handled by backend)
    if (filters.role) items = items.filter(a => a.role === filters.role);
    if (filters.status) items = items.filter(a => a.status === filters.status as any);
    if (filters.type) items = items.filter(a => a.type === filters.type as any);
    return items;
  }, [data, filters]);

  // Update accounts and total when API data arrives
  useEffect(() => {
    setAccounts(mapped);
    const total = data?.total ?? mapped.length;
    setPagination(prev => ({ ...prev, total }));
  }, [mapped, data]);

  const handleSearch = (newFilters: AccountFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      page: 1, // Reset to first page
      pageSize: pageSize,
      total: prev.total,
    }));
  };

  // Show offline indicator when not online
  if (!isOnline) {
    return (
      <div className="pb-10">
        <Breadcrumb
          items={[
            { title: 'Dashboard', link: '/dashboard' },
            'Accounts'
          ]}
          title="Accounts"
          className='absolute top-0 left-0 w-full px-6 bg-white dark:bg-gray-900'
        />
        <div className="pt-20">
          <OfflineIndicator 
            title="Accounts Not Available Offline"
            message="The accounts page requires an internet connection to load and manage user account data. Please check your connection and try again."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pt-1">
      <MainToolbar
        title="All Accounts"
        viewMode={viewMode}
        setViewMode={setViewMode}
        search={filters.search || ''}
        setSearch={(search) => {
          const newFilters = { ...filters, search };
          setFilters(newFilters);
          if(search && pagination.page > 1) {
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
          }
        }}
        filteredCount={pagination.total}
        showCreate={true}
        excelData={excelDataExported(exportData?.result || [])}
        excelColumnWidths={{
          id: 6, name: 25, email: 30, phone: 15, address: 30, status: 12,
          userType: 20, district: 15, sector: 15, cell: 15, village: 15,
          preferredLanguage: 20, nearByHealthCenter: 25, schoolName: 25,
          schoolAddress: 30, churchName: 25, churchAddress: 30,
          hospitalName: 25, hospitalAddress: 30, healthCenterName: 25,
          healthCenterAddress: 30, epiDistrict: 20, salary: 12,
          profile: 40, emailVerified: 15, roles: 30, createdAt: 15, updatedAt: 15
        }}
        excelFileName='all_accounts'
        createButton={{ to: '/dashboard/accounts/add-new', label: 'Add Account', icon: <FaPlus /> }}
      />

      <AccountsList
        accounts={accounts}
        title="All Accounts"
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.pageSize)}
        totalItems={pagination.total}
        pageSize={pagination.pageSize}
        loading={isLoading}
        viewMode={viewMode}
      />
    </div>
  );
}
