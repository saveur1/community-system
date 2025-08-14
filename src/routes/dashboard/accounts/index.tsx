import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { AccountsList } from '@/components/accounts/accounts-list';
import { Account, AccountFilters } from '@/types/account';

// Mock data - replace with real API calls
const mockAccounts: Account[] = Array.from({ length: 42 }, (_, i) => ({
  id: `acc-${i + 1}`,
  name: `User ${i + 1}`,
  email: i % 3 === 0 ? undefined : `user${i + 1}@example.com`,
  phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
  role: ['admin', 'user', 'moderator'][Math.floor(Math.random() * 3)],
  profile: i % 4 === 0 ? `https://i.pravatar.cc/150?img=${i % 70}` : undefined,
  address: i % 2 === 0 ? `${i + 100} Main St, City ${String.fromCharCode(65 + (i % 26))}` : undefined,
  type: ['community', 'religious', 'stakeholder', 'employee'][Math.floor(Math.random() * 4)] as any,
  status: ['active', 'inactive', 'pending'][Math.floor(Math.random() * 3)] as any,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)).toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const Route = createFileRoute('/dashboard/accounts/')({
  component: AccountsPage,
});

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AccountFilters>({});
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
      let filtered = [...mockAccounts];
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(account => 
          account.name.toLowerCase().includes(searchTerm) ||
          (account.email && account.email.toLowerCase().includes(searchTerm)) ||
          (account.phone && account.phone.includes(searchTerm)) ||
          (account.address && account.address.toLowerCase().includes(searchTerm)) ||
          account.role.toLowerCase().includes(searchTerm) ||
          account.type.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.role) {
        filtered = filtered.filter(account => account.role === filters.role);
      }
      
      if (filters.status) {
        filtered = filtered.filter(account => account.status === filters.status);
      }
      
      if (filters.type) {
        filtered = filtered.filter(account => account.type === filters.type);
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
      loading={loading}
    />
  );
}
