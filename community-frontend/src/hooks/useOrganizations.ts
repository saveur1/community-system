import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationsApi, type OrganizationListParams, type OrganizationListResponse, type OrganizationResponse, type OrganizationCreateRequest, type OrganizationUpdateRequest } from '../api/organizations';
import { toast } from 'react-toastify';
import { useNavigate } from '@tanstack/react-router';

// Query keys (organizations)
const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (params: OrganizationListParams) => [...organizationKeys.lists(), params ?? {}] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

// List organizations
export function useOrganizationsList(params: OrganizationListParams = { page: 1, limit: 10 }) {
  return useQuery<OrganizationListResponse>({
    queryKey: organizationKeys.list(params),
    queryFn: () => organizationsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single organization
export function useOrganization(organizationId?: string) {
  return useQuery<OrganizationResponse>({
    queryKey: organizationKeys.detail(organizationId ?? ''),
    queryFn: () => organizationsApi.getById(organizationId ?? ''),
    enabled: !!organizationId,
  });
}

// Create organization
export function useCreateOrganization() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: OrganizationCreateRequest) => organizationsApi.create(payload),
    onSuccess: async (_) => {
      await qc.invalidateQueries({ queryKey: organizationKeys.all });
      toast.success('Organization created successfully');
      // navigate to organizations list
      navigate({ to: '/dashboard/stakeholders' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create organization';
      toast.error(msg);
    },
  });
}

// Update organization
export function useUpdateOrganization(organizationId: string) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: OrganizationUpdateRequest) => organizationsApi.update(organizationId, payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: organizationKeys.detail(organizationId) }),
        qc.invalidateQueries({ queryKey: organizationKeys.all }),
      ]);
      toast.success('Organization updated successfully');
      navigate({ to: '/dashboard/stakeholders' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update organization';
      toast.error(msg);
    },
  });
}

// Delete organization
export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (organizationId: string) => organizationsApi.remove(organizationId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: organizationKeys.all });
      toast.success('Organization deleted successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete organization';
      toast.error(msg);
    },
  });
}