import sequelize from '../config/database';
import { User } from './users';
import { Role } from './role';
import UserRole from './userRole';
import Permission from './permission';
import Project from './project';
import Document from './document';
import Organization from './organization';
import Survey from './survey';
import Question from './question';
import Answer from './answer';
import Section from './section';
import Feedback from './feedback';
import FeedbackReply from './feedback-reply';
import CommunitySession from './community-session';
import Comment from './comment';
import SystemLog from './systemLog';
import Announcement from './announcement';
import Response from './response';
import Notification from './notification';
import Settings from './settings';
import Slideshow from './slideshow';
import Impact from './impact';

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

// Project <-> Survey associations
Project.hasMany(Survey, {
  as: 'surveys',
  foreignKey: 'projectId',
});
Survey.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId',
});

Project.belongsToMany(Organization, {
  through: 'project_stakeholders',
  as: 'stakeholders',
  foreignKey: 'projectId',
  otherKey: 'organizationId',
});
Organization.belongsToMany(Project, {
  through: 'project_stakeholders',
  as: 'projects',
  foreignKey: 'organizationId',
  otherKey: 'projectId',
});

// Project donors many-to-many
Project.belongsToMany(Organization, {
  through: 'project_donors',
  as: 'donors',
  foreignKey: 'projectId',
  otherKey: 'organizationId',
});
Organization.belongsToMany(Project, {
  through: 'project_donors',
  as: 'donorProjects',
  foreignKey: 'organizationId',
  otherKey: 'projectId',
});

// New Organization <-> User many-to-many association (was Stakeholder <-> User)
Organization.belongsToMany(User, {
  through: 'organization_users',
  as: 'users',
  foreignKey: 'organizationId',
  otherKey: 'userId',
});
User.belongsToMany(Organization, {
  through: 'organization_users',
  as: 'organizations',
  foreignKey: 'userId',
  otherKey: 'organizationId',
});

// Organizations and Owners (Users)
Organization.belongsTo(User, {
  as: 'owner',
  foreignKey: 'ownerId',
});
User.hasMany(Organization, {
  as: 'ownedOrganizations',
  foreignKey: 'ownerId',
});

// Survey associations (new)
Survey.hasMany(Section, {
  as: 'sections',
  foreignKey: 'surveyId',
  onDelete: 'CASCADE',
  hooks: true,
});
Section.belongsTo(Survey, {
  as: 'survey',
  foreignKey: 'surveyId',
});

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

// Section-Question associations
Section.hasMany(Question, {
  as: 'questions',
  foreignKey: 'sectionId',
  onDelete: 'CASCADE',
  hooks: true,
});
Question.belongsTo(Section, {
  as: 'section',
  foreignKey: 'sectionId',
});

// Responses: one response per submission
Survey.hasMany(Response, {
  as: 'responses',
  foreignKey: 'surveyId',
  onDelete: 'CASCADE',
  hooks: true,
});
Response.belongsTo(Survey, {
  as: 'survey',
  foreignKey: 'surveyId',
});

// Response belongs to a User (optional)
Response.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});
User.hasMany(Response, {
  as: 'responses',
  foreignKey: 'userId',
});

// Answers now belong to a Response and a Question
Response.hasMany(Answer, {
  as: 'answers',
  foreignKey: 'responseId',
  onDelete: 'CASCADE',
  hooks: true,
});
Answer.belongsTo(Response, {
  as: 'response',
  foreignKey: 'responseId',
});

// Survey <-> Role many-to-many for allowed roles
Survey.belongsToMany(Role, {
  through: 'survey_allowed_roles',
  as: 'allowedRoles',
  foreignKey: 'surveyId',
  otherKey: 'roleId',
});
Role.belongsToMany(Survey, {
  through: 'survey_allowed_roles',
  as: 'surveys',
  foreignKey: 'roleId',
  otherKey: 'surveyId',
});

//SURVEY ASSOCIATIONS
Survey.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});
User.hasMany(Survey, {
  as: 'surveys',
  foreignKey: 'createdBy',
});

//FEEDBACK ASSOCIATIONS
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

//USER FEEDBACK ASSOCIATIONS
User.hasMany(Feedback, {
  as: 'feedbacks',
  foreignKey: 'userId',
});
Feedback.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

//PROJECT FEEDBACK ASSOCIATIONS
Project.hasMany(Feedback, {
  as: 'feedbacks',
  foreignKey: 'projectId',
});
Feedback.belongsTo(Project, {
  as: 'project',
  foreignKey: 'projectId',
});

// FEEDBACK REPLIES ASSOCIATIONS
Feedback.hasMany(FeedbackReply, {
  as: 'replies',
  foreignKey: 'feedbackId',
  onDelete: 'CASCADE',
  hooks: true,
});
FeedbackReply.belongsTo(Feedback, {
  as: 'feedback',
  foreignKey: 'feedbackId',
});

// Reply -> User
FeedbackReply.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(FeedbackReply, { as: 'feedbackReplies', foreignKey: 'userId' });

// Reply -> Organization
FeedbackReply.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });
Organization.hasMany(FeedbackReply, { as: 'organizationFeedbackReplies', foreignKey: 'organizationId' });

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

//COMMUNITY SESSION ASSOCIATIONS
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

//SYSTEM LOG ASSOCIATIONS
User.hasMany(SystemLog, {
  as: 'systemLogs',
  foreignKey: 'userId',
});
SystemLog.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});

//SURVEYS ANSWERS to include user who answered
Answer.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});
User.hasMany(Answer, {
  as: 'answers',
  foreignKey: 'userId',
});

//ANNOUNCEMENT ASSOCIATIONS
Announcement.belongsToMany(Role, {
  through: 'announcement_roles',
  as: 'allowedRoles',
  foreignKey: 'announcementId',
  otherKey: 'roleId',
});
Role.belongsToMany(Announcement, {
  through: 'announcement_roles',
  as: 'announcements',
  foreignKey: 'roleId',
  otherKey: 'announcementId',
});

Announcement.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});
User.hasMany(Announcement, {
  as: 'announcements',
  foreignKey: 'createdBy',
});

//ORGANIZATION ASSOCIATIONS

Organization.hasMany(Document, { as: 'organizationDocuments', foreignKey: 'organizationId' });
Document.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Survey.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId',
});
Organization.hasMany(Survey, {
  as: 'organizationSurveys',
  foreignKey: 'organizationId',
});

Organization.hasMany(Question, { as: 'organizationQuestions', foreignKey: 'organizationId' });
Question.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Organization.hasMany(Answer, { as: 'organizationAnswers', foreignKey: 'organizationId' });
Answer.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Organization.hasMany(Feedback, { as: 'organizationFeedback', foreignKey: 'organizationId' });
Feedback.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Organization.hasMany(CommunitySession, { as: 'organizationSessions', foreignKey: 'organizationId' });
CommunitySession.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Organization.hasMany(Comment, { as: 'organizationComments', foreignKey: 'organizationId' });
Comment.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Organization.hasMany(Announcement, { as: 'organizationAnnouncements', foreignKey: 'organizationId' });
Announcement.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });

Role.belongsTo(Organization, { as: 'organization', foreignKey: 'organizationId' });
Organization.hasMany(Role, { as: 'organizationRoles', foreignKey: 'organizationId' });

// NOTIFICATION ASSOCIATIONS
Notification.belongsTo(User, {
  as: 'user',
  foreignKey: 'userId',
});
User.hasMany(Notification, {
  as: 'notifications',
  foreignKey: 'userId',
});

Notification.belongsTo(User, {
  as: 'creator',
  foreignKey: 'createdBy',
});
User.hasMany(Notification, {
  as: 'createdNotifications',
  foreignKey: 'createdBy',
});

Notification.belongsTo(Organization, {
  as: 'organization',
  foreignKey: 'organizationId',
});
Organization.hasMany(Notification, {
  as: 'organizationNotifications',
  foreignKey: 'organizationId',
});

// SETTINGS ASSOCIATIONS
Settings.hasMany(Slideshow, {
  as: 'slideshows',
  foreignKey: 'settingsId',
  onDelete: 'CASCADE',
  hooks: true,
});
Slideshow.belongsTo(Settings, {
  as: 'settings',
  foreignKey: 'settingsId',
});

Settings.hasMany(Impact, {
  as: 'impacts',
  foreignKey: 'settingsId',
  onDelete: 'CASCADE',
  hooks: true,
});
Impact.belongsTo(Settings, {
  as: 'settings',
  foreignKey: 'settingsId',
});

const db = { sequelize, User, Role, UserRole, Permission, Project, Document, Organization, Survey, Question, Answer, Section, Feedback, FeedbackReply, CommunitySession, Comment, SystemLog, Announcement, Response, Notification, Settings, Slideshow, Impact };

export default db;
