import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi, AuthResponse } from '../api/auth';
import { toast } from 'react-toastify';
import { useNavigate } from '@tanstack/react-router';

// Query keys for react-query
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

export function useAuth() {
  const navigate = useNavigate();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      navigate({to: "/dashboard"});
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
      if(data?.result?.user?.roles[0]?.name === "local_citizen"){
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
    enabled: true,
    retry: false,
  });

  // Logout function
  const logout = () => {
    authApi.logout();
    navigate({to: "/auth/login"});
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
    loginWithGoogle: googleAuthMutation.mutate,
    
    // Loading states
    isLoading: loginMutation.isPending || signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
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