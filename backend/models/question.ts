import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';

export interface QuestionAttributes {
  id: string;
  surveyId: string;

  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[] | null; // for choice types
  placeholder: string | null; // for text types
  createdAt?: Date;
  updatedAt?: Date;
}

export type QuestionCreationAttributes = Optional<
  QuestionAttributes,
  'id' | 'options' | 'placeholder' | 'createdAt' | 'updatedAt'
>;

class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
  declare id: string;
  declare surveyId: string;

  declare type: QuestionType;
  declare title: string;
  declare description: string;
  declare required: boolean;
  declare options: string[] | null;
  declare placeholder: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Question.init(
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

    type: {
      type: DataTypes.ENUM('single_choice', 'multiple_choice', 'text_input', 'textarea'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    options: {
      type: (sequelize.getDialect() === 'postgres' ? (DataTypes as any).JSONB : DataTypes.JSON),
      allowNull: true,
      defaultValue: null,
    },
    placeholder: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: 'Question',
    tableName: 'questions',
    timestamps: true,
  }
);

export default Question;
