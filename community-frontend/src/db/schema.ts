// src/db/schema.ts
import Dexie, { type Table } from 'dexie';

// Offline data types
export interface OfflineSurvey {
  id: string;
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  surveyType?: 'general' | 'report-form' | 'rapid-enquiry';
  organizationId?: string | null;
  createdBy?: string | null;
  startAt: string;
  endAt: string;
  questions: any[]; // JSON array
  sections?: any[];
  questionItems?: any[];
  responses?: any[];
  allowedRoles?: any[];
  organization?: any;
  creator?: any;
  createdAt?: string;
  updatedAt?: string;
  lastSynced?: number;
}

export interface OfflineSurveyResponse {
  id: string;
  surveyId: string;
  userId?: string | null;
  answers: Array<{
    questionId: string;
    answerText?: string | null;
    answerOptions?: string[] | null;
  }>;
  createdAt: string;
  updatedAt: string;
  lastSynced?: number;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount?: number;
}

export interface OfflineCommunitySession {
  id: string;
  title: string;
  shortDescription: string;
  documentId: string | null;
  type: 'video' | 'image' | 'document' | 'audio';
  allowedRoles: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  document?: any;
  creator?: any;
  comments?: any[];
  roles?: any[];
  lastSynced?: number;
}

export interface OfflineComment {
  id: string;
  content: string;
  communitySessionId: string;
  userId: string;
  timestamp?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: any;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount?: number;
  lastSynced?: number;
}

export interface OfflineFeedback {
  id: string;
  mainMessage: string | null;
  feedbackType: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  suggestions: string | null;
  followUpNeeded: boolean;
  status: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
  projectId: string | null;
  responderName?: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  otherFeedbackOn?: string;
  documents?: any[];
  user?: any;
  project?: any;
  syncStatus: 'pending' | 'synced' | 'failed';
  retryCount?: number;
  lastSynced?: number;
}

export interface OfflineProject {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  targetGroup: string | null;
  projectDuration: string | null;
  geographicArea: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: any[];
  stakeholders?: any[];
  donors?: any[];
  lastSynced?: number;
}

export interface SyncQueue {
  id?: number;
  entityType: 'survey' | 'surveyResponse' | 'communitySession' | 'comment' | 'feedback' | 'project';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  retryCount: number;
  lastAttempt?: number;
  error?: string;
  createdAt: number;
}

export interface AppMetadata {
  id?: number;
  key: string;
  value: any;
  updatedAt: number;
}

export class OfflineDatabase extends Dexie {
  // Tables
  surveys!: Table<OfflineSurvey>;
  surveyResponses!: Table<OfflineSurveyResponse>;
  communitySessions!: Table<OfflineCommunitySession>;
  comments!: Table<OfflineComment>;
  feedback!: Table<OfflineFeedback>;
  projects!: Table<OfflineProject>;
  syncQueue!: Table<SyncQueue>;
  metadata!: Table<AppMetadata>;

  constructor() {
    super('CommunityListeningDB');
    
    this.version(1).stores({
      surveys: 'id, title, status, surveyType, organizationId, createdBy, startAt, endAt, lastSynced',
      surveyResponses: 'id, surveyId, userId, syncStatus, createdAt, lastSynced',
      communitySessions: 'id, title, type, createdBy, isActive, createdAt, lastSynced',
      comments: 'id, communitySessionId, userId, syncStatus, createdAt, lastSynced',
      feedback: 'id, feedbackType, feedbackMethod, status, projectId, userId, syncStatus, createdAt, lastSynced',
      projects: 'id, name, status, createdAt, lastSynced',
      syncQueue: '++id, entityType, entityId, action, retryCount, createdAt, lastAttempt',
      metadata: '++id, key, updatedAt'
    });
  }
}

export const db = new OfflineDatabase();
