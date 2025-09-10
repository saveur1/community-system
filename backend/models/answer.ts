import { DataTypes, Model, Optional, type HasManyGetAssociationsMixin, type HasManyAddAssociationMixin, type HasManyAddAssociationsMixin, type HasManySetAssociationsMixin, type HasManyCreateAssociationMixin } from 'sequelize';
import sequelize from '../config/database';
import Document from './document';

// Extended answer value types based on question type
type AnswerValue = 
  | string // for text_input, textarea
  | string[] // for multiple_choice
  | string // for single_choice (single value)
  | string // for file_upload (file path/URL)
  | number // for rating (1-5 or custom max)
  | number // for linear_scale (selected value)
  | boolean // for boolean questions
  | Date // for date/time questions
  | null; // for unanswered questions

export interface AnswerAttributes {
  id: string;
  surveyId: string;
  responseId: string; // FK to Response.id
  questionId: string; // FK to Question.id
  
  // Main answer value (supports all question types)
  value: AnswerValue;
  
  // Additional metadata for specific question types
  metadata?: {
    // For file uploads
    fileInfo?: {
      fileName: string;
      fileType: string;
      fileSize: number; // in bytes
      filePath: string;
    };
    
    // For ratings
    ratingInfo?: {
      maxRating: number;
      label?: string;
    };
    
    // For linear scales
    scaleInfo?: {
      minValue: number;
      maxValue: number;
      minLabel?: string;
      maxLabel?: string;
    };
  } | null;
  
  // For backward compatibility
  answerText?: string | null;
  answerOptions?: string[] | null;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnswerCreationAttributes = Optional<
  AnswerAttributes,
  'id' | 'answerText' | 'answerOptions' | 'metadata' | 'createdAt' | 'updatedAt'
>;

class Answer extends Model<AnswerAttributes, AnswerCreationAttributes> implements AnswerAttributes {
  declare id: string;
  declare surveyId: string;
  declare responseId: string;
  declare questionId: string;
  
  // Main answer value
  declare value: AnswerValue;
  
  // Metadata for special question types
  declare metadata?: {
    fileInfo?: {
      fileName: string;
      fileType: string;
      fileSize: number;
      filePath: string;
    };
    ratingInfo?: {
      maxRating: number;
      label?: string;
    };
    scaleInfo?: {
      minValue: number;
      maxValue: number;
      minLabel?: string;
      maxLabel?: string;
    };
  } | null;
  
  // For backward compatibility
  declare answerText: string | null;
  declare answerOptions: string[] | null;
  
  // Timestamps
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // hasMany(Document) association mixins for file uploads
  declare getDocuments: HasManyGetAssociationsMixin<Document>;
  declare addDocument: HasManyAddAssociationMixin<Document, string>;
  declare addDocuments: HasManyAddAssociationsMixin<Document, string>;
  declare setDocuments: HasManySetAssociationsMixin<Document, string>;
  declare createDocument: HasManyCreateAssociationMixin<Document>;
  declare readonly documents?: Document[];
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
    responseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Main answer value (can be string, number, boolean, etc.)
    value: {
      type: (sequelize.getDialect() === 'postgres' ? (DataTypes as any).JSONB : DataTypes.JSON), // Store any type of value
      allowNull: true,
    },
    // Metadata for special question types
    metadata: {
      type: (sequelize.getDialect() === 'postgres' ? (DataTypes as any).JSONB : DataTypes.JSON),
      allowNull: true,
    },
    // For backward compatibility
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
