import { IUserAttributes } from './user-types';

export interface IUserCreateRequest {
  name: string;
  email: string;
  password?: string;
  address?: string;
  phone?: string;
  role?: IUserAttributes['roles'];
  status?: IUserAttributes['status'];
  profileImage?: string;
  // Optional: assign roles by id on creation
  roleIds?: string[];
}

export interface IUserUpdateRequest extends Partial<IUserCreateRequest> {}

export interface IUserResponse extends Omit<IUserAttributes, 'password' | 'resetPasswordCode' | 'resetPasswordExpires' | 'googleId'> {
  profileImage?: string;
}
