import { Model, Optional } from 'sequelize';
import { IRoleAttributes } from './role.types';

export type UserStatus = 'active' | 'inactive';

export interface IUserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string | null;
  phone?: string | null;
  status: UserStatus;
  resetPasswordCode?: string | null;
  resetPasswordExpires?: Date | null;
  googleId?: string | null;
  salary?: number | null;
  profile?: string | null;
  emailVerified?: boolean;
  verified?: boolean;
  roles?: IRoleAttributes[];
  userRoles?: any[]; // For the association
  createdAt?: Date;
  updatedAt?: Date;
}

export type IUserCreationAttributes = Optional<
  IUserAttributes, 
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'password' | 'googleId'
>;

export interface IUserInstance extends 
  Model<IUserAttributes, IUserCreationAttributes>,
  IUserAttributes {
    // Add any instance methods here if needed
    hasRoleByName: (roleName: string) => Promise<boolean>;
    hasPermission: (permissionName: string) => Promise<boolean>;
    addRoleById: (roleId: string) => Promise<void>;
    removeRoleById: (roleId: string) => Promise<void>;
    $get: (association: string) => Promise<any>;
    $add: (association: string, instance: any) => Promise<void>;
    
    // Sequelize association methods
    getRoles: (options?: any) => Promise<any[]>;
    addRole: (role: any, options?: any) => Promise<void>;
    removeRole: (role: any, options?: any) => Promise<void>;
    setRoles: (roles: any[], options?: any) => Promise<void>;
    hasRole: (role: any) => Promise<boolean>;
}
