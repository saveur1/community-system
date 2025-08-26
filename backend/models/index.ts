import sequelize from '../config/database';
import { User } from './users';
import { Role } from './role';
import UserRole from './userRole';
import Permission from './permission';
import Tweet from './tweet';
import Project from './project';
import Document from './document';
import Stakeholder from './stakeholder';

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

// Project associations
Project.hasMany(Document, {
  as: 'documents',
  foreignKey: 'projectId',
});
Document.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId',
});

Project.belongsToMany(Stakeholder, {
  through: 'project_stakeholders',
  as: 'stakeholders',
  foreignKey: 'projectId',
  otherKey: 'stakeholderId',
});
Stakeholder.belongsToMany(Project, {
  through: 'project_stakeholders',
  as: 'projects',
  foreignKey: 'stakeholderId',
  otherKey: 'projectId',
});

const db = { sequelize, User, Role, UserRole, Permission, Tweet, Project, Document, Stakeholder };

export default db;
