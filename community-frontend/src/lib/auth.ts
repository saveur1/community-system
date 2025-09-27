import { redirect } from '@tanstack/react-router';
import { authApi, type User } from '@/api/auth';
import { QueryClient } from '@tanstack/react-query';

export interface AuthContext {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

// Auth utility functions for route guards
export const authUtils = {
  // Check if user is authenticated (for protected routes)
  requireAuth: async (queryClient: QueryClient): Promise<AuthContext> => {
    try {
      // Try to get current user from cache first
      const cachedData = queryClient.getQueryData(['auth', 'currentUser']);
      
      if (cachedData) {
        const user = (cachedData as any)?.result?.user;
        if (user) {
          return {
            isAuthenticated: true,
            user,
            isLoading: false
          };
        }
      }

      // If no cache, fetch from API
      const response = await authApi.getCurrentUser();
      const user = response?.result?.user;
      
      if (!user) {
        throw redirect({
          to: '/auth/login',
          search: {
            redirect: globalThis.location?.pathname + globalThis.location?.search || '/dashboard'
          }
        });
      }

      return {
        isAuthenticated: true,
        user,
        isLoading: false
      };
    } catch (error) {
      // If API call fails, redirect to login
      throw redirect({
        to: '/auth/login',
        search: {
          redirect: globalThis.location?.pathname + globalThis.location?.search || '/dashboard'
        }
      });
    }
  },

  // Check if user is already authenticated (for auth routes)
  requireGuest: async (queryClient: QueryClient): Promise<AuthContext> => {
    try {
      // Check cache first
      const cachedData = queryClient.getQueryData(['auth', 'currentUser']);
      console.log("cached data", cachedData);
      
      if (cachedData) {
        const user = (cachedData as any)?.result?.user;
        if (user) {
          throw redirect({ to: '/dashboard' });
        }
      }

      // Quick check with API (non-blocking)
      try {
        const response = await authApi.getCurrentUser();
        const user = response?.result?.user;
        
        if (user) {
          throw redirect({ to: '/dashboard' });
        }
      } catch {
        // If API fails, allow access to auth routes
      }

      return {
        isAuthenticated: false,
        user: null,
        isLoading: false
      };
    } catch (error) {
      // Re-throw redirect errors
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
      
      return {
        isAuthenticated: false,
        user: null,
        isLoading: false
      };
    }
  },

  // Get auth context without redirects (for public routes)
  getAuthContext: async (queryClient: QueryClient): Promise<AuthContext> => {
    try {
      // Check cache first
      const cachedData = queryClient.getQueryData(['auth', 'currentUser']);
      
      if (cachedData) {
        const user = (cachedData as any)?.result?.user;
        return {
          isAuthenticated: !!user,
          user: user || null,
          isLoading: false
        };
      }

      // Try API call but don't throw on failure
      try {
        const response = await authApi.getCurrentUser();
        const user = response?.result?.user;
        
        return {
          isAuthenticated: !!user,
          user: user || null,
          isLoading: false
        };
      } catch {
        return {
          isAuthenticated: false,
          user: null,
          isLoading: false
        };
      }
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        isLoading: false
      };
    }
  }
};

// Token management for faster auth checks
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  setToken: (token: string, remember: boolean = false): void => {
    if (remember) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  },

  hasToken: (): boolean => {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }
};
