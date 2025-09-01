import sequelize from '../config/database';
import { User } from './users';
import { Role } from './role';
import UserRole from './userRole';
import Permission from './permission';
import Tweet from './tweet';
import Project from './project';
import Document from './document';
import Stakeholder from './stakeholder';
import Survey from './survey';
import Question from './question';
import Answer from './answer';
import Feedback from './feedback';
import CommunitySession from './community-session';
import Comment from './comment';

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

// New Stakeholder <-> User many-to-many association
Stakeholder.belongsToMany(User, {
  through: 'stakeholder_users',
  as: 'users',
  foreignKey: 'stakeholderId',
  otherKey: 'userId',
});
User.belongsToMany(Stakeholder, {
  through: 'stakeholder_users',
  as: 'stakeholders',
  foreignKey: 'userId',
  otherKey: 'stakeholderId',
});

// Survey associations (new)
Survey.hasMany(Question, {
  as: 'questionItems',
  foreignKey: 'surveyId',
  onDelete: 'CASCADE',
  hooks: true,
});
Question.belongsTo(Survey, {
  as: 'survey',
  foreignKey: 'surveyId',
});

Survey.hasMany(Answer, {
  as: 'answers',
  foreignKey: 'surveyId',
  onDelete: 'CASCADE',
  hooks: true,
});
Answer.belongsTo(Survey, {
  as: 'survey',
  foreignKey: 'surveyId',
});

// Feedback associations
Feedback.belongsToMany(Document, {
  through: 'feedback_documents',
  as: 'documents',
  foreignKey: 'feedbackId',
  otherKey: 'documentId',
});
Document.belongsToMany(Feedback, {
  through: 'feedback_documents',
  as: 'feedback',
  foreignKey: 'documentId',
  otherKey: 'feedbackId',
});

// User-Feedback Association
User.hasMany(Feedback, {
  as: 'feedback',
  foreignKey: 'userId',
});
Feedback.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

// Project-Feedback Association
Project.hasMany(Feedback, {
  as: 'feedback',
  foreignKey: 'projectId',
});
Feedback.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId',
});

// CommunitySession associations
CommunitySession.belongsTo(Document, {
  as: 'document',
  foreignKey: 'documentId',
});
Document.hasMany(CommunitySession, {
  as: 'communitySessions',
  foreignKey: 'documentId',
});

CommunitySession.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});
User.hasMany(CommunitySession, {
  as: 'createdSessions',
  foreignKey: 'createdBy',
});

CommunitySession.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'communitySessionId',
  onDelete: 'CASCADE',
  hooks: true,
});
Comment.belongsTo(CommunitySession, {
  as: 'communitySession',
  foreignKey: 'communitySessionId',
});

// CommunitySession <-> Role many-to-many association for access control
CommunitySession.belongsToMany(Role, {
  through: 'community_session_roles',
  as: 'roles',
  foreignKey: 'communitySessionId',
  otherKey: 'roleId',
});
Role.belongsToMany(CommunitySession, {
  through: 'community_session_roles',
  as: 'communitySessions',
  foreignKey: 'roleId',
  otherKey: 'communitySessionId',
});

Comment.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});
User.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'userId',
});

const db = { sequelize, User, Role, UserRole, Permission, Tweet, Project, Document, Stakeholder, Survey, Question, Answer, Feedback, CommunitySession, Comment };

export default db;
