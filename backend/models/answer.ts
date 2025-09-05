import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AnswerAttributes {
  id: string;
  surveyId: string;
  questionId: string; // FK to Question.id
  answerText: string | null; // for text/textarea
  answerOptions: string[] | null; // for choice types
  userId?: string; // Optional FK to User.id
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnswerCreationAttributes = Optional<
  AnswerAttributes,
  'id' | 'answerText' | 'answerOptions' | 'createdAt' | 'updatedAt'
>;

class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  declare id: string;
  declare surveyId: string;
  declare questionId: string;
  declare answerText: string | null;
  declare answerOptions: string[] | null;
  declare userId?: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Answer.init(
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
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    answerText: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    answerOptions: {
      type: (sequelize.getDialect() === 'postgres' ? (DataTypes as any).JSONB : DataTypes.JSON),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Answer',
    tableName: 'answers',
    timestamps: true,
  }
);

export default Answer;
