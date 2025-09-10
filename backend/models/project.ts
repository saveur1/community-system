import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Document from './document';
import type {
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyRemoveAssociationMixin,
} from 'sequelize';
import Organization from './organization';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface ProjectAttributes {
  id: string;
  name: string;
  status: ProjectStatus;
  targetGroup: string | null;
  projectDuration: string | null; // e.g., "6 months", "1 year", etc.
  geographicArea: string | null; // Location where project takes place
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProjectCreationAttributes = Optional<ProjectAttributes, 'id' | 'status' | 'targetGroup' | 'projectDuration' | 'geographicArea' | 'createdAt' | 'updatedAt'>;

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  declare id: string;
  declare name: string;
  declare status: ProjectStatus;
  declare targetGroup: string | null;
  declare projectDuration: string | null;
  declare geographicArea: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // hasMany(Document) association mixins (resources)
  declare getDocuments: HasManyGetAssociationsMixin<Document>;
  declare addDocument: HasManyAddAssociationMixin<Document, string>;
  declare addDocuments: HasManyAddAssociationsMixin<Document, string>;
  declare setDocuments: HasManySetAssociationsMixin<Document, string>;
  declare createDocument: HasManyCreateAssociationMixin<Document>;
  declare readonly documents?: Document[];

  // belongsToMany(Organization) association mixins for donors
  declare getDonors: BelongsToManyGetAssociationsMixin<Organization>;
  declare addDonor: BelongsToManyAddAssociationMixin<Organization, string>;
  declare addDonors: BelongsToManyAddAssociationsMixin<Organization, string>;
  declare setDonors: BelongsToManySetAssociationsMixin<Organization, string>;
  declare removeDonor: BelongsToManyRemoveAssociationMixin<Organization, string>;
  declare readonly donors?: Organization[];
}

Project.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
    comment: 'Project Name',
  },
  status: {
    type: DataTypes.ENUM('draft', 'in_progress', 'completed', 'on_hold', 'cancelled'),
    allowNull: false,
    defaultValue: 'in_progress',
  },
  targetGroup: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectDuration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Duration of the project (e.g., "6 months", "1 year")',
  },
  geographicArea: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Geographic area where the project takes place',
  },
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  timestamps: true,
});

export default Project;
