import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Document from './document';
import type {
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyCreateAssociationMixin,
} from 'sequelize';

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface ProjectAttributes {
  id: string;
  name: string;
  status: ProjectStatus;
  targetGroup: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProjectCreationAttributes = Optional<ProjectAttributes, 'id' | 'status' | 'targetGroup' | 'createdAt' | 'updatedAt'>;

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  declare id: string;
  declare name: string;
  declare status: ProjectStatus;
  declare targetGroup: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // hasMany(Document) association mixins (resources)
  declare getDocuments: HasManyGetAssociationsMixin<Document>;
  declare addDocument: HasManyAddAssociationMixin<Document, string>;
  declare addDocuments: HasManyAddAssociationsMixin<Document, string>;
  declare setDocuments: HasManySetAssociationsMixin<Document, string>;
  declare createDocument: HasManyCreateAssociationMixin<Document>;
  declare readonly documents?: Document[];
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
}, {
  sequelize,
  modelName: 'Project',
  tableName: 'projects',
  timestamps: true,
});

export default Project;
