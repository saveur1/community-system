import { useState, useEffect, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import type { Account, AccountFilters } from '@/types/account';
import { useUsersList } from '@/hooks/useUsers';
import type { User } from '@/api/auth';

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

  const { data, isLoading } = useUsersList({ page: pagination.page, limit: pagination.pageSize });

  // Map API users to Account[] whenever data or filters change
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

    // Apply client-side filters until backend filtering is added
    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(term) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.phone && a.phone.includes(term)) ||
        (a.address && a.address.toLowerCase().includes(term)) ||
        a.role.toLowerCase().includes(term) ||
        a.type.toLowerCase().includes(term)
      );
    }
    if (filters.role) items = items.filter(a => a.role === filters.role);
    if (filters.status) items = items.filter(a => a.status === filters.status as any);
    if (filters.type) items = items.filter(a => a.type === filters.type as any);
    return items;
  }, [data, filters]);

  // Update accounts and total when API data arrives
  useEffect(() => {
    setAccounts(mapped);
    const total = data?.meta?.total ?? mapped.length;
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
      pageSize,
      total: prev.total,
    }));
  };

  return (
    <AccountsList
      accounts={accounts}
      title="All Accounts"
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      currentPage={pagination.page}
      totalPages={Math.ceil(pagination.total / pagination.pageSize)}
      totalItems={pagination.total}
      pageSize={pagination.pageSize}
      loading={isLoading}
    />
  );
}
