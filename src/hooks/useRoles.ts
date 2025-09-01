import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rolesApi, type RolesListParams, type RolesListResponse, type RoleResponse, type RoleCreateRequest, type RoleUpdateRequest } from '../api/roles';
import { toast } from 'react-toastify';

// Query keys for roles
export const rolesKeys = {
  all: ['roles'] as const,
  list: (params?: RolesListParams) => [
    ...rolesKeys.all,
    'list',
    params?.page ?? 1,
    params?.limit ?? 20,
    params?.search ?? '',
  ] as const,
  detail: (id: string) => [...rolesKeys.all, 'detail', id] as const,
};

// List roles
export function useRolesList(params: RolesListParams = { page: 1, limit: 20 }) {
  return useQuery<RolesListResponse>({
    queryKey: rolesKeys.list(params),
    queryFn: () => rolesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single role by id
export function useRole(roleId: string, enabled: boolean = true) {
  return useQuery<RoleResponse>({
    queryKey: rolesKeys.detail(roleId),
    queryFn: () => rolesApi.getById(roleId),
    enabled: !!roleId && enabled,
  });
}

// Create role
export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleCreateRequest) => rolesApi.create(payload),
    onSuccess: async () => {
      toast.success('Role created successfully');
      await qc.invalidateQueries({ queryKey: rolesKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create role';
      toast.error(msg);
    },
  });
}

// Update role
export function useUpdateRole(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoleUpdateRequest) => rolesApi.update(roleId, payload),
    onSuccess: async () => {
      toast.success('Role updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: rolesKeys.detail(roleId) }),
        qc.invalidateQueries({ queryKey: rolesKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update role';
      toast.error(msg);
    },
  });
}

// Delete role
export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => rolesApi.remove(roleId),
    onSuccess: async (_data, roleId) => {
      toast.success('Role deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: rolesKeys.all }),
        qc.invalidateQueries({ queryKey: rolesKeys.detail(roleId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete role';
      toast.error(msg);
    },
  });
}

// Add permission to role
export function useAddPermissionToRole(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => rolesApi.addPermission(roleId, permissionId),
    onSuccess: async () => {
      toast.success('Permission added to role');
      await qc.invalidateQueries({ queryKey: rolesKeys.detail(roleId) });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to add permission';
      toast.error(msg);
    },
  });
}

// Remove permission from role
export function useRemovePermissionFromRole(roleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => rolesApi.removePermission(roleId, permissionId),
    onSuccess: async () => {
      toast.success('Permission removed from role');
      await qc.invalidateQueries({ queryKey: rolesKeys.detail(roleId) });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to remove permission';
      toast.error(msg);
    },
  });
}
