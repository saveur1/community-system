// src/services/offline-api.ts
import { offlineStorage } from '../services/offline-storage';
import { projectsApi, type ProjectEntity, type ProjectsListParams } from '@/api/projects';
import type { ServiceResponse } from '@/api/surveys';
import { offlineCommon } from './common';

export class OfflineApiService {
  private static instance: OfflineApiService;

  static getInstance(): OfflineApiService {
    if (!OfflineApiService.instance) {
      OfflineApiService.instance = new OfflineApiService();
    }
    return OfflineApiService.instance;
  }

  // Projects API with offline support
  async getProjects(params: ProjectsListParams = { page: 1, limit: 10 }): Promise<ServiceResponse<ProjectEntity[]>> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await projectsApi.list(params);
        // Clear existing projects data before caching new user-specific data
        await offlineStorage.clearTableData('projects');
        await offlineStorage.cacheProjects(response.result as any);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    // Fallback to cached data
    const cachedProjects = await offlineStorage.getCachedProjects();

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = cachedProjects.slice(startIndex, endIndex);

    return {
      message: 'Data retrieved from offline cache',
      result: paginatedResults as ProjectEntity[],
      meta: {
        total: cachedProjects.length,
        page,
        totalPages: Math.ceil(cachedProjects.length / limit),
        limit
      }
    };
  }

  async getProject(projectId: string): Promise<ServiceResponse<ProjectEntity>> {
    try {
      if (offlineCommon.isOnline()) {
        const response = await projectsApi.getById(projectId);
        await offlineStorage.cacheProjects([response.result as any]);
        return response;
      }
    } catch (error) {
      console.log('API request failed, falling back to cache:', error);
    }

    const cachedProject = await offlineStorage.getCachedProject(projectId);
    if (!cachedProject) {
      throw new Error('Project not found in offline cache');
    }

    return {
      message: 'Data retrieved from offline cache',
      result: cachedProject as ProjectEntity
    };
  }
}

export const offlineProjectsApi = OfflineApiService.getInstance();