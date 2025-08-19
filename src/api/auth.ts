import { client } from './client';

// Auth API functions
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await client.post('/auth/login', credentials);
    return data;
  },

  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const { data } = await client.post('/auth/signup', userData);
    return data;
  },

  forgotPassword: async (emailData: ForgotPasswordRequest): Promise<{ message: string }> => {
    const { data } = await client.post('/auth/forgot-password', emailData);
    return data;
  },

  resetPassword: async (resetData: ResetPasswordRequest): Promise<{ message: string }> => {
    const { data } = await client.post('/auth/reset-password', resetData);
    return data;
  },

  getGoogleAuth: async (): Promise<{ url: string }> => {
    const response = await client.get('/auth/google', { maxRedirects: 0, validateStatus: null });
    return { url: response.headers.location };
  },

  getGoogleCallback: async (code: string): Promise<AuthResponse> => {
    const { data } = await client.get(`/auth/google/callback?code=${code}`);
    return data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const { data } = await client.get('/auth/me');
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await client.post('/auth/logout');
    return data;
  },
};


// AUTH TYPES
 type LoginRequest = {
    email: string;
    password: string;
  };
  
  type SignupRequest = {
    name: string;
    email: string;
    password: string;
    address?: string;
    phone?: string;
  };
  
  type ForgotPasswordRequest = {
    email: string;
  };
  
  type ResetPasswordRequest = {
    token: string;
    newPassword: string;
  };

  export type User = {
    id: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
    status: string;
    profile?: string;
    roles: Array<{
      id: string;
      name: string;
      description: string;
      userRoles: Array<{
        id: string;
        name: string;
        description: string;
      }>;
      permissions: Array<{
        id: string;
        name: string;
        description: string;
      }>;
    }>;
  };
  
  export type AuthResponse = {
    result:{ user: User;}
  };
