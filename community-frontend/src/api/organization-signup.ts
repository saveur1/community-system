import { client } from './client';

export type OrganizationSignupRequest = {
  token: string;
  organizationId: string;
  name: string;
  password: string;
  phone: string;
};

export type OrganizationSignupResponse = {
  message: string;
  result: {
    user: {
      id: string;
      name: string;
      email: string;
    }
  };
};

export const organizationSignupApi = {
  signup: async (payload: OrganizationSignupRequest): Promise<OrganizationSignupResponse> => {
    const { data } = await client.post('/auth/organization-signup', payload);
    return data;
  },
};
