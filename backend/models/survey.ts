// Add these imports to your existing survey.ts file
import { DataTypes, Model, Optional, type HasManyGetAssociationsMixin, type HasManyAddAssociationMixin, type HasManyAddAssociationsMixin, type HasManySetAssociationsMixin, type HasManyCreateAssociationMixin, type BelongsToManyGetAssociationsMixin, type BelongsToManyAddAssociationMixin, type BelongsToManyAddAssociationsMixin, type BelongsToManySetAssociationsMixin, type BelongsToManyRemoveAssociationMixin, type BelongsToGetAssociationMixin } from 'sequelize';
import sequelize from '../config/database';
import Question from './question';
import Answer from './answer';
import Response from './response';
import Role from './role';
import Section from './section';
import Organization from './organization';
import Project from './project'; // ADD THIS IMPORT
import { User } from './users';

// ... keep your existing interfaces ...

export interface SurveyAttributes {
  id: string;
  title: string;
  description: string;
  projectId?: string | null; // ADD THIS: Foreign key to Project
  estimatedTime: string;
  status: 'active' | 'paused' | 'archived';
  surveyType?: 'general' | 'report-form';
  createdBy?: string | null;
  organizationId?: string | null;
  startAt: Date;
  endAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type SurveyCreationAttributes = Optional<SurveyAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> implements SurveyAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare projectId?: string | null; // ADD THIS
  declare estimatedTime: string;
  declare status: 'active' | 'paused' | 'archived';
  declare surveyType?: 'general' | 'report-form';
  declare createdBy?: string | null;
  declare organizationId?: string | null;
  declare startAt: Date;
  declare endAt: Date;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // ... keep all your existing association mixins ...

  // ADD THIS: BelongsTo (Survey -> Project) mixin
  declare getProjectDetails: BelongsToGetAssociationMixin<Project>;
  declare readonly projectDetails?: Project | null;
}

Survey.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Survey Title',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    // ADD THIS: Foreign key to Project
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'projects',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Project this survey belongs to',
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0',
      comment: 'Estimated time in minutes (string to match UI)',
    },
    startAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When survey becomes available (required)',
    },
    endAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When survey closes (required)',
    },
    surveyType: {
      type: DataTypes.ENUM('general', 'report-form'),
      defaultValue: 'general',
      allowNull: false,
      comment: 'Type of survey',
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'User who created this survey',
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id',
      },
      onDelete: 'SET NULL',
      comment: 'Organization this survey belongs to',
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'archived'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Survey status lifecycle',
    },
  },
  {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
    timestamps: true,
  }
);

export default Survey;