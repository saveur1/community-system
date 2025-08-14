import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import { Account, AccountFilters } from '@/types/account';

// Mock data for community accounts
const mockCommunityAccounts: Account[] = Array.from({ length: 32 }, (_, i) => ({
  id: `comm-${i + 1}`,
  name: `Community Member ${i + 1}`,
  email: i % 3 === 0 ? undefined : `community${i + 1}@example.com`,
  phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
  role: ['member', 'leader', 'volunteer'][Math.floor(Math.random() * 3)],
  profile: i % 3 === 0 ? `https://i.pravatar.cc/150?img=${i % 70}` : undefined,
  address: `${i + 100} Community St, Neighborhood ${String.fromCharCode(65 + (i % 26))}`,
  type: 'community',
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as any,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const Route = createFileRoute('/dashboard/accounts/community')({
  component: CommunityAccountsPage,
});

function CommunityAccountsPage() {
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
      let filtered = [...mockCommunityAccounts];
      
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
    <AccountsList
      accounts={accounts}
      title="Community Accounts"
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
