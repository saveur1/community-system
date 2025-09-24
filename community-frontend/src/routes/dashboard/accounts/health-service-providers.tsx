import { useState, useEffect, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import type { Account, AccountFilters } from '@/types/account';
import { useUsersList } from '@/hooks/useUsers';
import type { User } from '@/api/auth';

function isHealthServiceProvider(userType?: string) {
  if (!userType) return false;
  return userType==='Health service providers';
}

export const Route = createFileRoute('/dashboard/accounts/health-service-providers')({
  component: EmployeesAccountsPage,
});

function EmployeesAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filters, setFilters] = useState<Omit<AccountFilters, 'type'>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const { data, isLoading } = useUsersList({ page: pagination.page, limit: pagination.pageSize });

  const mapped = useMemo(() => {
    const list: User[] = data?.result ?? [];
    let items: Account[] = list
      .filter(u => isHealthServiceProvider(u.userType))
      .map((u) => ({
        id: String(u.id),
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.roles?.[0]?.name || 'user',
        profile: u.profile,
        address: u.address,
        type: 'Health service providers',
        status: (u.status as any) || 'active',
        createdAt: (u as any).createdAt ? String((u as any).createdAt) : new Date().toISOString(),
        updatedAt: (u as any).updatedAt ? String((u as any).updatedAt) : new Date().toISOString(),
      }));

    if (filters.search) {
      const term = filters.search.toLowerCase();
      items = items.filter(a =>
        a.name.toLowerCase().includes(term) ||
        (a.email && a.email.toLowerCase().includes(term)) ||
        (a.phone && a.phone.includes(term)) ||
        (a.address && a.address.toLowerCase().includes(term)) ||
        (a.role && a.role.toLowerCase().includes(term))
      );
    }
    if (filters.role) items = items.filter(a => a.role === filters.role);
    if (filters.status) items = items.filter(a => a.status === filters.status as any);
    return items;
  }, [data, filters]);

  useEffect(() => {
    setAccounts(mapped);
    const total = data?.meta?.total ?? mapped.length;
    setPagination(prev => ({ ...prev, total }));
  }, [mapped, data]);

  const handleSearch = (newFilters: AccountFilters) => {
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
    <AccountsList
      accounts={accounts}
      title="Health service providers"
      addButtonLabel="add new"
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      currentPage={pagination.page}
      totalPages={Math.ceil(pagination.total / pagination.pageSize)}
      totalItems={pagination.total}
      pageSize={pagination.pageSize}
      loading={isLoading}
      onDeleteAccount={(acc) => {
        setAccounts(prev => prev.filter(a => a.id !== acc.id));
        setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      }}
    />
  );
}
