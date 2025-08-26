import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type ProjectsListParams, type ProjectsListResponse, type ProjectResponse, type ProjectCreateRequest, type ProjectUpdateRequest } from '../api/projects';
import { toast } from 'react-toastify';

// Query keys for projects
export const projectsKeys = {
  all: ['projects'] as const,
  list: (params?: ProjectsListParams) => [
    ...projectsKeys.all,
    'list',
    params?.page ?? 1,
    params?.limit ?? 10,
  ] as const,
  detail: (id: string) => [...projectsKeys.all, 'detail', id] as const,
};

// List projects
export function useProjectsList(params: ProjectsListParams = { page: 1, limit: 10 }) {
  return useQuery<ProjectsListResponse>({
    queryKey: projectsKeys.list(params),
    queryFn: () => projectsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

// Get single project by id
export function useProject(projectId: string, enabled: boolean = true) {
  return useQuery<ProjectResponse>({
    queryKey: projectsKeys.detail(projectId),
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId && enabled,
  });
}

// Create project
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectCreateRequest) => projectsApi.create(payload),
    onSuccess: async () => {
      toast.success('Project created successfully');
      await qc.invalidateQueries({ queryKey: projectsKeys.all });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create project';
      toast.error(msg);
    },
  });
}

// Update project
export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProjectUpdateRequest) => projectsApi.update(projectId, payload),
    onSuccess: async () => {
      toast.success('Project updated successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: projectsKeys.detail(projectId) }),
        qc.invalidateQueries({ queryKey: projectsKeys.all }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update project';
      toast.error(msg);
    },
  });
}

// Delete project
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: async (_data, projectId) => {
      toast.success('Project deleted successfully');
      await Promise.all([
        qc.invalidateQueries({ queryKey: projectsKeys.all }),
        qc.invalidateQueries({ queryKey: projectsKeys.detail(projectId) }),
      ]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete project';
      toast.error(msg);
    },
  });
}
