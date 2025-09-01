import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FeedbackAttributes {
  id: string;
  mainMessage: string | null;
  feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  suggestions: string | null;
  followUpNeeded: boolean;
  status: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
  projectId: string | null;
  responderName: string | null;
  userId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FeedbackCreationAttributes = Optional<FeedbackAttributes, 'id' | 'mainMessage' | 'suggestions' | 'followUpNeeded' | 'status' | 'feedbackType' | 'projectId' | 'userId' | 'createdAt' | 'updatedAt'>;

class Feedback extends Model<FeedbackAttributes, FeedbackCreationAttributes> implements FeedbackAttributes {
  declare id: string;
  declare mainMessage: string | null;
  declare feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  declare feedbackMethod: 'text' | 'voice' | 'video';
  declare suggestions: string | null;
  declare followUpNeeded: boolean;
  declare status: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
  declare responderName: string | null;
  declare projectId: string | null;
  declare userId: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Association mixins will be added by Sequelize
  declare getDocuments: () => Promise<any[]>;
  declare addDocument: (document: any) => Promise<void>;
  declare removeDocument: (document: any) => Promise<void>;
}

Feedback.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  mainMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedbackType: {
    type: DataTypes.ENUM('positive', 'negative', 'suggestion', 'concern'),
    allowNull: true,
    field: 'feedback_type',
  },
  feedbackMethod: {
    type: DataTypes.ENUM('text', 'voice', 'video'),
    allowNull: false,
    field: 'feedback_method',
  },
  suggestions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  followUpNeeded: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'follow_up_needed',
  },
  responderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'responder_name',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be submitted anonymously
    field: 'user_id',
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true, // Not all feedback is project-specific
    field: 'project_id',
  },
  status: {
    type: DataTypes.ENUM('submitted', 'Acknowledged', 'Resolved', 'Rejected'),
    allowNull: false,
    defaultValue: 'submitted',
  },
}, {
  sequelize,
  modelName: 'Feedback',
  tableName: 'feedback',
  timestamps: true,
});

export default Feedback;
