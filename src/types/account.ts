export interface Account {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: string;
  profile?: string;
  address?: string;
  type: 'community' | 'religious' | 'stakeholder' | 'employee';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface AccountFilters {
  search?: string;
  role?: string;
  status?: string;
  type?: string;
}

export interface AccountListResponse {
  data: Account[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
