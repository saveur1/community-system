import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stakeholdersApi, type StakeholderListParams, type StakeholderListResponse, type StakeholderResponse, type StakeholderCreateRequest, type StakeholderUpdateRequest } from '../api/stakeholders';
import { toast } from 'react-toastify';

const stakeholderKeys = {
  all: ['stakeholders'] as const,
  lists: () => [...stakeholderKeys.all, 'list'] as const,
  list: (params: StakeholderListParams) => [...stakeholderKeys.lists(), params] as const,
  details: () => [...stakeholderKeys.all, 'detail'] as const,
  detail: (id: string) => [...stakeholderKeys.details(), id] as const,
};

export function useStakeholdersList(params: StakeholderListParams) {
  return useQuery({
    queryKey: stakeholderKeys.list(params),
    queryFn: () => stakeholdersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useStakeholder(stakeholderId: string) {
  return useQuery({
    queryKey: stakeholderKeys.detail(stakeholderId),
    queryFn: () => stakeholdersApi.getById(stakeholderId),
    enabled: !!stakeholderId,
  });
}

export function useCreateStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StakeholderCreateRequest) => stakeholdersApi.create(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: stakeholderKeys.all });
      toast.success('Stakeholder created successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create stakeholder';
      toast.error(msg);
    },
  });
}

export function useUpdateStakeholder(stakeholderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: StakeholderUpdateRequest) => stakeholdersApi.update(stakeholderId, payload),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: stakeholderKeys.detail(stakeholderId) }),
        qc.invalidateQueries({ queryKey: stakeholderKeys.all }),
      ]);
      toast.success('Stakeholder updated successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update stakeholder';
      toast.error(msg);
    },
  });
}

export function useDeleteStakeholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stakeholderId: string) => stakeholdersApi.remove(stakeholderId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: stakeholderKeys.all });
      toast.success('Stakeholder deleted successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete stakeholder';
      toast.error(msg);
    },
  });
} 