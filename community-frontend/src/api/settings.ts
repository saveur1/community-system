// src/api/settings.ts
import { client } from './client';

// Mirror backend ServiceResponse shape
export type ServiceResponse<T> = {
  message: string;
  result: T;
  total?: number;
  page?: number;
  totalPages?: number;
  limit?: number;
};

// Settings entity types (aligns with backend models)
export type SlideshowEntity = {
  id: string;
  settingsId: string;
  imageUrl: string;
  altText: string;
  statisticsTitle: string;
  statisticsLabel: string;
  statisticsValue: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ImpactEntity = {
  id: string;
  settingsId: string;
  icon: string;
  value: string;
  label: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SettingsEntity = {
  id: string;
  websiteName: string;
  websiteDescription?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  socialLinks?: object | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  slideshows?: SlideshowEntity[];
  impacts?: ImpactEntity[];
};

// Request types
export type SlideshowCreateRequest = {
  imageUrl: string;
  altText: string;
  statisticsTitle: string;
  statisticsLabel: string;
  statisticsValue: string;
  order?: number;
  isActive?: boolean;
};

export type SlideshowUpdateRequest = Partial<SlideshowCreateRequest>;

export type ImpactCreateRequest = {
  icon: string;
  value: string;
  label: string;
  color: string;
  order?: number;
  isActive?: boolean;
};

export type ImpactUpdateRequest = Partial<ImpactCreateRequest>;

export type SettingsCreateRequest = {
  websiteName: string;
  websiteDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialLinks?: object;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isActive?: boolean;
  slideshows?: SlideshowCreateRequest[];
  impacts?: ImpactCreateRequest[];
};

export type SettingsUpdateRequest = Partial<SettingsCreateRequest> & {
  removeSlideshowIds?: string[];
  removeImpactIds?: string[];
};

// Response types
export type SettingsResponse = ServiceResponse<SettingsEntity>;
export type SlideshowResponse = ServiceResponse<SlideshowEntity>;
export type ImpactResponse = ServiceResponse<ImpactEntity>;

export const settingsApi = {
  // Main settings endpoints
  getSettings: async (): Promise<SettingsResponse> => {
    const { data } = await client.get(`/settings`);
    return data;
  },

  getSettingsById: async (settingsId: string): Promise<SettingsResponse> => {
    const { data } = await client.get(`/settings/${settingsId}`);
    return data;
  },

  createSettings: async (payload: SettingsCreateRequest): Promise<SettingsResponse> => {
    const { data } = await client.post(`/settings`, payload);
    return data;
  },

  updateSettings: async (settingsId: string, payload: SettingsUpdateRequest): Promise<SettingsResponse> => {
    const { data } = await client.put(`/settings/${settingsId}`, payload);
    return data;
  },

  deleteSettings: async (settingsId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/settings/${settingsId}`);
    return data;
  },

  // Slideshow management endpoints
  addSlideshow: async (settingsId: string, payload: SlideshowCreateRequest): Promise<SlideshowResponse> => {
    const { data } = await client.post(`/settings/${settingsId}/slideshows`, payload);
    return data;
  },

  updateSlideshow: async (slideshowId: string, payload: SlideshowUpdateRequest): Promise<SlideshowResponse> => {
    const { data } = await client.put(`/settings/slideshows/${slideshowId}`, payload);
    return data;
  },

  deleteSlideshow: async (slideshowId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/settings/slideshows/${slideshowId}`);
    return data;
  },

  // Impact management endpoints
  addImpact: async (settingsId: string, payload: ImpactCreateRequest): Promise<ImpactResponse> => {
    const { data } = await client.post(`/settings/${settingsId}/impacts`, payload);
    return data;
  },

  updateImpact: async (impactId: string, payload: ImpactUpdateRequest): Promise<ImpactResponse> => {
    const { data } = await client.put(`/settings/impacts/${impactId}`, payload);
    return data;
  },

  deleteImpact: async (impactId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/settings/impacts/${impactId}`);
    return data;
  },
};
