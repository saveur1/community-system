import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { permissionsApi, type PermissionsListResponse, type PermissionResponse, type PermissionCreateRequest, type PermissionUpdateRequest } from '../api/permissions';
import { toast } from 'react-toastify';

// Query keys for permissions
export const permissionsKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionsKeys.all, 'list'] as const,
  detail: (id: string) => [...permissionsKeys.all, 'detail', id] as const,
};

// List permissions
export function usePermissionsList() {
  return useQuery<PermissionsListResponse>({
    queryKey: permissionsKeys.list(),
    queryFn: () => permissionsApi.list(),
  });
}

// Get single permission by id
export function usePermission(permissionId: string, enabled: boolean = true) {
  return useQuery<PermissionResponse>({
    queryKey: permissionsKeys.detail(permissionId),
    queryFn: () => permissionsApi.getById(permissionId),
    enabled: !!permissionId && enabled,
  });
}


// Create permission
export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PermissionCreateRequest) => permissionsApi.create(payload),
    onSuccess: async () => {
      toast.success('Permission created successfully');
      await qc.invalidateQueries({ queryKey: permissionsKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create permission';
      toast.error(msg);
    },
  });
}

// Update permission
export function useUpdatePermission(permissionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PermissionUpdateRequest) => permissionsApi.update(permissionId, payload),
    onSuccess: async () => {
      toast.success('Permission updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: permissionsKeys.detail(permissionId) }),
        qc.invalidateQueries({ queryKey: permissionsKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update permission';
      toast.error(msg);
    },
  });
}

// Delete permission
export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (permissionId: string) => permissionsApi.remove(permissionId),
    onSuccess: async (_data, permissionId) => {
      toast.success('Permission deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: permissionsKeys.all }),
        qc.invalidateQueries({ queryKey: permissionsKeys.detail(permissionId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete permission';
      toast.error(msg);
    },
  });
}
