import { useState, useEffect, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import type { Account, AccountFilters } from '@/types/account';
import { useDeleteUser, useUsersList } from '@/hooks/useUsers';
import type { User } from '@/api/auth';
import MainToolbar from '@/components/common/main-toolbar';
import { FaPlus } from 'react-icons/fa';

function isCommunityMember(userType?: string) {
  if (!userType) return false;
  return userType==='Community Members';
}

export const Route = createFileRoute('/dashboard/accounts/community-members')({
  component: CommunityAccountsPage,
});

function CommunityAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filters, setFilters] = useState<Omit<AccountFilters, 'type'>>({});
  const { mutateAsync: deleteAccount } = useDeleteUser();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const { data, isLoading } = useUsersList({
    page: pagination.page,
    limit: pagination.pageSize,
    search: filters.search
  });

  // Export data formatter based on IUserAttributes
  const excelDataExported = (users: any[]) => {
    return users?.filter(user => isCommunityMember(user.userType))?.map((user, index) => ({
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
      roles: user?.roles?.map((role: any) => role.name).join(', ') || '',
      createdAt: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      updatedAt: user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : ''
    }))
  };

  const mapped = useMemo(() => {
    const list: User[] = data?.result ?? [];
    let items: Account[] = list
      .filter(u => isCommunityMember(u.userType))
      .map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.roles?.[0]?.name || 'user',
        profile: u.profile,
        address: u.address,
        type: 'Community Members',
        status: (u.status as any) || 'active',
        createdAt: (u as any).createdAt ? String((u as any).createdAt) : new Date().toISOString(),
        updatedAt: (u as any).updatedAt ? String((u as any).updatedAt) : new Date().toISOString(),
      }));

    // Apply remaining client-side filters (search is now handled by backend)
    if (filters.role) items = items.filter(a => a.role === filters.role);
    if (filters.status) items = items.filter(a => a.status === filters.status as any);
    return items;
  }, [data, filters]);

  useEffect(() => {
    setAccounts(mapped);
    const total = data?.total ?? mapped.length;
    setPagination(prev => ({ ...prev, total }));
  }, [mapped, data]);

  const handleSearch = (newFilters: AccountFilters) => {
    // Remove type filter since we're only showing community accounts
    const { type, ...rest } = newFilters;
    setFilters(rest);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      page: 1, // Reset to first page
      pageSize,
      total: prev.total,
    }));
  };

  return (
    <div className="pt-1">
      <MainToolbar
        title="Community Members"
        viewMode={viewMode}
        setViewMode={setViewMode}
        search={filters.search || ''}
        setSearch={(search) => {
          const newFilters = { ...filters, search };
          setFilters(newFilters);
          setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
        }}
        filteredCount={pagination.total}
        showCreate={true}
        excelData={excelDataExported(data?.result || [])}
        excelColumnWidths={{
          id: 6, name: 25, email: 30, phone: 15, address: 30, status: 12,
          userType: 20, district: 15, sector: 15, cell: 15, village: 15,
          preferredLanguage: 20, nearByHealthCenter: 25, schoolName: 25,
          schoolAddress: 30, churchName: 25, churchAddress: 30,
          hospitalName: 25, hospitalAddress: 30, healthCenterName: 25,
          healthCenterAddress: 30, epiDistrict: 20, salary: 12,
          profile: 40, emailVerified: 15, roles: 30, createdAt: 15, updatedAt: 15
        }}
        excelFileName='community_members'
        createButton={{
          to: "/dashboard/accounts/add-new",
          label: "add member",
          icon: <FaPlus />
        }}
      />

      <AccountsList
        accounts={accounts}
        title="Community Members"
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
        onDeleteAccount={async (acc) => {
          await deleteAccount(acc.id);
          setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        }}
      />
    </div>
  );
}
