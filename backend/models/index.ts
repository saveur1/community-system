import sequelize from '../config/database';
import { User } from './users';
import { Role } from './role';
import UserRole from './userRole';
import Permission from './permission';

// Centralized associations to avoid circular imports
User.belongsToMany(Role, {
  through: UserRole,
  as: 'roles',
  foreignKey: 'userId',
  otherKey: 'roleId',
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'roleId',
  otherKey: 'userId',
});

// Role <-> Permission many-to-many via role_permissions table
Role.belongsToMany(Permission, {
  through: 'role_permissions',
  as: 'permissions',
  foreignKey: 'roleId',
  otherKey: 'permissionId',
});

Permission.belongsToMany(Role, {
  through: 'role_permissions',
  foreignKey: 'permissionId',
  otherKey: 'roleId',
});

const db = { sequelize, User, Role, UserRole, Permission };

export default db;
