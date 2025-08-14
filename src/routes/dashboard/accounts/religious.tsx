import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import { Account, AccountFilters } from '@/types/account';

// Mock data for religious accounts
const mockReligiousAccounts: Account[] = Array.from({ length: 28 }, (_, i) => ({
  id: `rel-${i + 1}`,
  name: `Religious Leader ${i + 1}`,
  email: `leader${i + 1}@faith.org`,
  phone: `+1 (555) ${Math.floor(200 + Math.random() * 800)}-${Math.floor(1000 + Math.random() * 9000)}`,
  role: ['clergy', 'elder', 'volunteer', 'administrator'][Math.floor(Math.random() * 4)],
  profile: i % 2 === 0 ? `https://i.pravatar.cc/150?img=${(i % 70) + 10}` : undefined,
  address: `${i + 50} Faith Ave, ${['Church', 'Mosque', 'Temple', 'Shrine'][i % 4]} District`,
  type: 'religious',
  status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as any,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 200)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const Route = createFileRoute('/dashboard/accounts/religious')({
  component: ReligiousAccountsPage,
});

function ReligiousAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Omit<AccountFilters, 'type'>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // Simulate API call
  useEffect(() => {
    setLoading(true);
    
    // Simulate network delay
    const timer = setTimeout(() => {
      // Apply filters
      let filtered = [...mockReligiousAccounts];
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(account => 
          account.name.toLowerCase().includes(searchTerm) ||
          (account.email && account.email.toLowerCase().includes(searchTerm)) ||
          (account.phone && account.phone.includes(searchTerm)) ||
          (account.address && account.address.toLowerCase().includes(searchTerm)) ||
          (account.role && account.role.toLowerCase().includes(searchTerm))
        );
      }
      
      if (filters.role) {
        filtered = filtered.filter(account => account.role === filters.role);
      }
      
      if (filters.status) {
        filtered = filtered.filter(account => account.status === filters.status);
      }
      
      const total = filtered.length;
      const start = (pagination.page - 1) * pagination.pageSize;
      const paginated = filtered.slice(start, start + pagination.pageSize);
      
      setAccounts(paginated);
      setPagination(prev => ({ ...prev, total }));
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, pagination.page, pagination.pageSize]);

  const handleSearch = (newFilters: AccountFilters) => {
    // Remove type filter since we're only showing religious accounts
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
      title="Religious Accounts"
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      currentPage={pagination.page}
      totalPages={Math.ceil(pagination.total / pagination.pageSize)}
      totalItems={pagination.total}
      pageSize={pagination.pageSize}
      loading={loading}
    />
  );
}
