import { DataTypes, Model, Optional, type HasManyGetAssociationsMixin, type HasManyAddAssociationMixin, type HasManyAddAssociationsMixin, type HasManySetAssociationsMixin, type HasManyCreateAssociationMixin } from 'sequelize';
import sequelize from '../config/database';
import Question from './question';
import Answer from './answer';

export type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';

export interface BaseQuestion {
  id: number;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'single_choice' | 'multiple_choice';
  options: string[];
  placeholder?: never;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text_input' | 'textarea';
  options?: never;
  placeholder: string;
}

export type AuthoredQuestion = ChoiceQuestion | TextQuestion;

export interface SurveyAttributes {
  id: string;
  title: string;
  description: string;
  project: string; // from UI currently a string label; can be changed to FK later
  estimatedTime: string; // keep as string per UI (e.g., "15")
  status: 'active' | 'paused' | 'archived';

  createdAt?: Date;
  updatedAt?: Date;
}

export type SurveyCreationAttributes = Optional<SurveyAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class Survey extends Model<SurveyAttributes, SurveyCreationAttributes> implements SurveyAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare project: string;
  declare estimatedTime: string;
  declare status: 'active' | 'paused' | 'archived';

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // hasMany(Question) association mixins
  declare getQuestionItems: HasManyGetAssociationsMixin<Question>;
  declare addQuestionItem: HasManyAddAssociationMixin<Question, string>;
  declare addQuestionItems: HasManyAddAssociationsMixin<Question, string>;
  declare setQuestionItems: HasManySetAssociationsMixin<Question, string>;
  declare createQuestionItem: HasManyCreateAssociationMixin<Question>;
  declare readonly questionItems?: Question[];

  // hasMany(Answer) association mixins
  declare getAnswers: HasManyGetAssociationsMixin<Answer>;
  declare addAnswer: HasManyAddAssociationMixin<Answer, string>;
  declare addAnswers: HasManyAddAssociationsMixin<Answer, string>;
  declare setAnswers: HasManySetAssociationsMixin<Answer, string>;
  declare createAnswer: HasManyCreateAssociationMixin<Answer>;
  declare readonly answers?: Answer[];
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
    project: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
      comment: 'Project label selected in UI',
    },
    estimatedTime: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '0',
      comment: 'Estimated time in minutes (string to match UI)',
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
