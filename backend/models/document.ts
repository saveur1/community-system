import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface DocumentAttributes {
  id: string;
  documentName: string;
  size: number | null;
  type: string | null;
  addedAt: Date;
  documentUrl: string | null;
  projectId: string | null;
  userId: string | null;
  publicId: string | null;
  deleteToken: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DocumentCreationAttributes = Optional<DocumentAttributes, 'id' | 'size' | 'type' | 'addedAt' | 'documentUrl' | 'projectId' | 'publicId' | 'deleteToken' | 'createdAt' | 'updatedAt'>;

class Document extends Model<DocumentAttributes, DocumentCreationAttributes> implements DocumentAttributes {
  declare id: string;
  declare documentName: string;
  declare size: number | null;
  declare type: string | null;
  declare addedAt: Date;
  declare documentUrl: string | null;
  declare projectId: string | null;
  declare userId: string | null;
  declare publicId: string | null;
  declare deleteToken: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Document.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  documentName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  addedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'added_at',
  },
  documentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'document_url',
    validate: {
      isUrlOrNull(value: unknown) {
        if (value && typeof value === 'string') {
          const ok = /^https?:\/\//.test(value);
          if (!ok) throw new Error('documentUrl must be a valid URL');
        }
      }
    }
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'project_id',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
  },
  publicId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'public_id',
  },
  deleteToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'delete_token',
  },
}, {
  sequelize,
  modelName: 'Document',
  tableName: 'documents',
  timestamps: true,
});

export default Document;
