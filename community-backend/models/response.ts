import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ResponseAttributes {
  id: string;
  surveyId: string;
  userId?: string | null; // nullable for anonymous
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResponseCreationAttributes = Optional<
  ResponseAttributes,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;

class Response extends Model<ResponseAttributes, ResponseCreationAttributes> implements ResponseAttributes {
  declare id: string;
  declare surveyId: string;
  declare userId?: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Response.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Response',
    tableName: 'responses',
    timestamps: true,
  }
);

export default Response;

