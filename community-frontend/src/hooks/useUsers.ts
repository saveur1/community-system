import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { usersApi, type UsersListParams, type UsersListResponse, type UserResponse, type UserCreateRequest, type UserUpdateRequest } from '../api/users';
import { toast } from 'react-toastify';

// Query keys for users
export const usersKeys = {
  all: ['users'] as const,
  list: (params?: UsersListParams) => [...usersKeys.all, 'list', params?.page ?? 1, params?.limit ?? 10] as const,
  detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
};

// List users
export function useUsersList(params: UsersListParams = { page: 1, limit: 10 }) {
  return useQuery<UsersListResponse>({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single user by id
export function useUser(userId: string, enabled: boolean = true) {
  return useQuery<UserResponse>({
    queryKey: usersKeys.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId && enabled,
  });
}

// Create user
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserCreateRequest) => usersApi.create(payload),
    onSuccess: async () => {
      toast.success('User created successfully');
      await qc.invalidateQueries({ queryKey: usersKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create user';
      toast.error(msg);
    },
  });
}

// Update user
export function useUpdateUser(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserUpdateRequest) => usersApi.update(userId, payload),
    onSuccess: async () => {
      toast.success('User updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        qc.invalidateQueries({ queryKey: usersKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update user';
      toast.error(msg);
    },
  });
}

// Delete user
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersApi.remove(userId),
    onSuccess: async (_, userId) => {
      toast.success('User deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: usersKeys.all }),
        qc.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete user';
      toast.error(msg);
    },
  });
}

// Combined verify/unverify hook
export function useVerifyAndUnverify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; targetStatus: 'active' | 'pending' }) => {
      const { userId, targetStatus } = params;
      return usersApi.update(userId, { status: targetStatus } as UserUpdateRequest);
    },
    onSuccess: async (_data, variables) => {
      const { userId, targetStatus } = variables as { userId: string; targetStatus: 'active' | 'pending' };
      toast.success(targetStatus === 'active' ? 'User verified successfully' : 'User set to pending verification');
      await Promise.all([
        qc.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        qc.invalidateQueries({ queryKey: usersKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update verification status';
      toast.error(msg);
    },
  });
}

// Combined activate/deactivate hook
export function useActivateAndDeactivate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; targetStatus: 'active' | 'inactive' }) => {
      const { userId, targetStatus } = params;
      return usersApi.update(userId, { status: targetStatus } as UserUpdateRequest);
    },
    onSuccess: async (_data, variables) => {
      const { userId, targetStatus } = variables as { userId: string; targetStatus: 'active' | 'inactive' };
      toast.success(targetStatus === 'active' ? 'User activated successfully' : 'User deactivated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: usersKeys.detail(userId) }),
        qc.invalidateQueries({ queryKey: usersKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update active status';
      toast.error(msg);
    },
  });
}
