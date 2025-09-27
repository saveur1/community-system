import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi,type AuthResponse } from '../api/auth';
import { toast } from 'react-toastify';
import { useNavigate } from '@tanstack/react-router';
import { tokenManager } from '@/lib/auth';

// Query keys for react-query
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data: AuthResponse) => {
      // Cache the user data immediately after successful login
      if (data?.result?.user) {
        // Cache the full auth response to match the expected format
        queryClient.setQueryData(authKeys.currentUser, data);
        
        // Mark that we have a successful login for faster checks
        tokenManager.setToken('authenticated', true);
      }
      
      // Check for redirect parameter in URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/dashboard';
      navigate({ to: redirectTo });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Login failed';
      if(errorMessage?.toLocaleLowerCase() === 'account needs verification.'){
        navigate({to: "/approval-required"});
      }
      else {
        toast.error(errorMessage);
      }
    },
  });

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data: AuthResponse) => {
      // Cache the user data immediately after successful signup
      if (data?.result?.user) {
        // Cache the full auth response to match the expected format
        queryClient.setQueryData(authKeys.currentUser, data);
        
        // Mark that we have a successful signup for faster checks
        tokenManager.setToken('authenticated', true);
      }
      
      if(data?.result?.user?.roles[0]?.name === "general_population"){
        navigate({to: "/dashboard"});
      }
      else {
        navigate({to: "/approval-required"});
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Signup failed';
      toast.error(errorMessage);
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to send reset link';
      toast.error(errorMessage);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Password reset failed';
      toast.error(errorMessage);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Password change failed';
      toast.error(errorMessage);
    },
  });

  // Google auth
  const googleAuthMutation = useMutation({
    mutationFn: authApi.getGoogleAuth,
    onSuccess: (data) => {
      // Redirect to Google OAuth URL
      window.location.href = data.url;
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to initiate Google login';
      toast.error(errorMessage);
    },
  });

  // Get current user query
  const currentUserQuery = useQuery<AuthResponse>({
    queryKey: authKeys.currentUser,
    queryFn: authApi.getCurrentUser,
    enabled: tokenManager.hasToken(), // Only fetch if we have a token
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        tokenManager.removeToken(); // Clear invalid token
        return false;
      }
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
      tokenManager.removeToken(); // Clear stored token
      queryClient.removeQueries({ queryKey: authKeys.currentUser }); // Clear cached user data
      navigate({to: "/auth/login"});
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear token and cached data, then redirect to login
      tokenManager.removeToken();
      queryClient.removeQueries({ queryKey: authKeys.currentUser });
      navigate({to: "/auth/login"});
    }
  };

  // Refresh the current user data
  const refreshUser = async () => {
    try {
      await currentUserQuery.refetch();
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return {
    // Mutations
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    loginWithGoogle: googleAuthMutation.mutate,
    
    // Loading states
    isLoading: loginMutation.isPending || signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    error: loginMutation.error,
    
    // Auth state
    user: currentUserQuery.data?.result?.user || null,
    isUserLoading: currentUserQuery.isPending,
    isAuthenticated: !!currentUserQuery.data?.result?.user,
  
    // Actions
    logout,
    refreshUser,
  };
}

export default useAuth;