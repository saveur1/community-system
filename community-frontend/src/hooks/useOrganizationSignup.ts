import { useMutation } from '@tanstack/react-query';
import { organizationSignupApi, type OrganizationSignupRequest, type OrganizationSignupResponse } from '../api/organization-signup';
import { toast } from 'react-toastify';
import { useRouter } from '@tanstack/react-router';

export function useOrganizationSignup() {
    const route = useRouter();
  return useMutation<OrganizationSignupResponse, any, OrganizationSignupRequest>({
    mutationFn: organizationSignupApi.signup,
    onSuccess: (data) => {
      toast.success(data.message || 'Account created successfully');
      route.navigate({ to: '/dashboard' });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create organization account';
      toast.error(msg);
    },
  });
}
