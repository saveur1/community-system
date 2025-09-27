// src/hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settings';
import type {
  SettingsCreateRequest,
  SettingsUpdateRequest,
  SlideshowCreateRequest,
  SlideshowUpdateRequest,
  ImpactCreateRequest,
  ImpactUpdateRequest,
} from '@/api/settings';
import { toast } from 'react-toastify';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  settings: () => [...settingsKeys.all, 'list'] as const,
  settingsById: (id: string) => [...settingsKeys.all, 'detail', id] as const,
};

// Get active settings
export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.settings(),
    queryFn: settingsApi.getSettings,
    select: (data) => data.result,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get settings by ID
export const useSettingsById = (settingsId: string) => {
  return useQuery({
    queryKey: settingsKeys.settingsById(settingsId),
    queryFn: () => settingsApi.getSettingsById(settingsId),
    select: (data) => data.result,
    enabled: !!settingsId,
  });
};

// Create settings
export const useCreateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SettingsCreateRequest) => settingsApi.createSettings(payload),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create settings';
      toast.error(message);
    },
  });
};

// Update settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settingsId, payload }: { settingsId: string; payload: SettingsUpdateRequest }) =>
      settingsApi.updateSettings(settingsId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      queryClient.invalidateQueries({ queryKey: settingsKeys.settingsById(variables.settingsId) });
      toast.success('Settings updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update settings';
      toast.error(message);
    },
  });
};

// Delete settings
export const useDeleteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settingsId: string) => settingsApi.deleteSettings(settingsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Settings deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete settings';
      toast.error(message);
    },
  });
};

// Slideshow mutations
export const useAddSlideshow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settingsId, payload }: { settingsId: string; payload: SlideshowCreateRequest }) =>
      settingsApi.addSlideshow(settingsId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Slideshow added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add slideshow';
      toast.error(message);
    },
  });
};

export const useUpdateSlideshow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slideshowId, payload }: { slideshowId: string; payload: SlideshowUpdateRequest }) =>
      settingsApi.updateSlideshow(slideshowId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Slideshow updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update slideshow';
      toast.error(message);
    },
  });
};

export const useDeleteSlideshow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slideshowId: string) => settingsApi.deleteSlideshow(slideshowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Slideshow deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete slideshow';
      toast.error(message);
    },
  });
};

// Impact mutations
export const useAddImpact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settingsId, payload }: { settingsId: string; payload: ImpactCreateRequest }) =>
      settingsApi.addImpact(settingsId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Impact statistic added successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to add impact statistic';
      toast.error(message);
    },
  });
};

export const useUpdateImpact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ impactId, payload }: { impactId: string; payload: ImpactUpdateRequest }) =>
      settingsApi.updateImpact(impactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Impact statistic updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to update impact statistic';
      toast.error(message);
    },
  });
};

export const useDeleteImpact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (impactId: string) => settingsApi.deleteImpact(impactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
      toast.success('Impact statistic deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to delete impact statistic';
      toast.error(message);
    },
  });
};

// Bulk operations helper hook
export const useSettingsBulkOperations = () => {
  const updateSettings = useUpdateSettings();
  const addSlideshow = useAddSlideshow();
  const updateSlideshow = useUpdateSlideshow();
  const deleteSlideshow = useDeleteSlideshow();
  const addImpact = useAddImpact();
  const updateImpact = useUpdateImpact();
  const deleteImpact = useDeleteImpact();

  const saveBulkChanges = async (
    settingsId: string,
    changes: {
      settings?: SettingsUpdateRequest;
      newSlideshows?: SlideshowCreateRequest[];
      updatedSlideshows?: Array<{ id: string; data: SlideshowUpdateRequest }>;
      deletedSlideshowIds?: string[];
      newImpacts?: ImpactCreateRequest[];
      updatedImpacts?: Array<{ id: string; data: ImpactUpdateRequest }>;
      deletedImpactIds?: string[];
    }
  ) => {
    try {
      // Update main settings if provided
      if (changes.settings) {
        await updateSettings.mutateAsync({ settingsId, payload: changes.settings });
      }

      // Handle slideshow operations
      if (changes.deletedSlideshowIds?.length) {
        await Promise.all(
          changes.deletedSlideshowIds.map(id => deleteSlideshow.mutateAsync(id))
        );
      }

      if (changes.updatedSlideshows?.length) {
        await Promise.all(
          changes.updatedSlideshows.map(({ id, data }) =>
            updateSlideshow.mutateAsync({ slideshowId: id, payload: data })
          )
        );
      }

      if (changes.newSlideshows?.length) {
        await Promise.all(
          changes.newSlideshows.map(slideshow =>
            addSlideshow.mutateAsync({ settingsId, payload: slideshow })
          )
        );
      }

      // Handle impact operations
      if (changes.deletedImpactIds?.length) {
        await Promise.all(
          changes.deletedImpactIds.map(id => deleteImpact.mutateAsync(id))
        );
      }

      if (changes.updatedImpacts?.length) {
        await Promise.all(
          changes.updatedImpacts.map(({ id, data }) =>
            updateImpact.mutateAsync({ impactId: id, payload: data })
          )
        );
      }

      if (changes.newImpacts?.length) {
        await Promise.all(
          changes.newImpacts.map(impact =>
            addImpact.mutateAsync({ settingsId, payload: impact })
          )
        );
      }

      toast.success('All changes saved successfully');
      return true;
    } catch (error) {
      toast.error('Failed to save some changes');
      throw error;
    }
  };

  return {
    saveBulkChanges,
    isLoading: 
      updateSettings.isPending ||
      addSlideshow.isPending ||
      updateSlideshow.isPending ||
      deleteSlideshow.isPending ||
      addImpact.isPending ||
      updateImpact.isPending ||
      deleteImpact.isPending,
  };
};
