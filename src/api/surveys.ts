// src/api/surveys.ts
import { client } from './client';
import { RoleEntity } from './roles';

// Mirror backend ServiceResponse shape
export type ServiceResponse<T> = {
  message: string;
  result: T;
  meta?: {
    total?: number;
    page?: number;
    totalPages?: number;
    limit?: number;
    [key: string]: any;
  };
};

// Types aligned with backend controllers/models
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea' | 'file_upload' | 'rating' | 'linear_scale';

export type AuthoredChoiceQuestion = {
  id: number;
  type: 'single_choice' | 'multiple_choice';
  title: string;
  description: string;
  required: boolean;
  sectionId: string;
  questionNumber?: number;
  options: string[];
};

export type AuthoredTextQuestion = {
  id: number;
  type: 'text_input' | 'textarea';
  title: string;
  description: string;
  required: boolean;
  sectionId: string;
  questionNumber?: number;
  placeholder: string;
};

export type AuthoredFileUploadQuestion = {
  id: number;
  type: 'file_upload';
  title: string;
  description: string;
  required: boolean;
  sectionId: string;
  questionNumber?: number;
  allowedTypes: string[];
  maxSize: number;
};

export type AuthoredRatingQuestion = {
  id: number;
  type: 'rating';
  title: string;
  description: string;
  required: boolean;
  sectionId: string;
  questionNumber?: number;
  maxRating: number;
  ratingLabel?: string;
};

export type AuthoredLinearScaleQuestion = {
  id: number;
  type: 'linear_scale';
  title: string;
  description: string;
  required: boolean;
  sectionId: string;
  questionNumber?: number;
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
};

export type AuthoredQuestion = AuthoredChoiceQuestion | AuthoredTextQuestion | AuthoredFileUploadQuestion | AuthoredRatingQuestion | AuthoredLinearScaleQuestion;

export type Section = {
  id: string;
  title: string;
  description?: string;
};

export type QuestionItem = {
  id: string;
  surveyId: string;
  sectionId?: string | null;
  questionNumber?: number | null;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[] | null;
  placeholder: string | null;
  allowedTypes: string[] | null;
  maxSize: number | null;
  maxRating: number | null;
  ratingLabel: string | null;
  minValue: number | null;
  maxValue: number | null;
  minLabel: string | null;
  maxLabel: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AnswerItem = {
  id: string;
  surveyId: string;
  questionId: string;
  answerText: string | null;
  answerOptions: string[] | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ResponseItem = {
  id: string;
  surveyId: string;
  userId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  answers?: AnswerItem[];
};

export type SurveyMini = {
  id: string;
  title: string;
  surveyType?: 'general' | 'report-form';
  project?: string;
  estimatedTime?: string;
  organization?: { id: string; name: string } | null;
};

export type SurveyResponseRow = {
  id: string;
  createdAt: string;
  updatedAt: string;
  survey: SurveyMini;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roles: { id: string; name: string; category?: string }[];
  } | null;
  answers: Array<{
    id: string;
    questionId: string;
    answerText: string | null;
    answerOptions: string[] | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type SurveyResponsesList = ServiceResponse<SurveyResponseRow[]>;

export type SurveyEntity = {
  id: string;
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  status: 'active' | 'paused' | 'archived';
  surveyType?: 'general' | 'report-form';
  organizationId?: string | null;
  createdBy?: string | null;
  startAt: string;
  endAt: string;
  questions: AuthoredQuestion[]; // JSON array as authored in UI
  createdAt?: string;
  updatedAt?: string;
  // included relations
  sections?: Section[];
  questionItems?: QuestionItem[];
  responses?: ResponseItem[];
  answers?: AnswerItem[]; // User's answers for this survey
  allowedRoles?: RoleEntity[];
  organization?: {
    id: string;
    name: string;
  };
  creator?: {
    id: string;
    name: string;
  };
};

export type SurveysListParams = { 
  page?: number; 
  limit?: number; 
  status?: 'active' | 'paused' | 'archived'; 
  surveyType?: 'general' | 'report-form';
  responded?: boolean;
  owner?: 'me' | 'any' | "other" | undefined;
  allowed?: boolean;
  startDate?: string;
  endDate?: string;
};

export type SurveysListResponse = ServiceResponse<SurveyEntity[]>;
export type SurveyResponse = ServiceResponse<SurveyEntity>;

// Analytics types
export type SurveyAnalytics = {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  uniqueRespondents: number;
  completionRate: number;
  avgTimeMins: number;
  minTimeMins: number;
  maxTimeMins: number;
  medianTimeMins: number;
  trends: Array<{
    date: string;
    count: number;
  }>;
  questionAnalytics: Array<{
    questionId: string;
    title: string;
    type: string;
    required: boolean;
    responseCount: number;
    skipRate: number;
    answerDistribution: any;
  }>;
};

export type QuestionAnalytics = {
  questionId: string;
  title: string;
  type: string;
  required: boolean;
} & ({
  type: 'choice';
  distribution: { [option: string]: number };
  totalAnswers: number;
} | {
  type: 'numeric';
  average: number;
  min: number;
  max: number;
  median: number;
  totalAnswers: number;
  histogram: { [value: string]: number };
} | {
  type: 'text';
  totalAnswers: number;
  responses: Array<{
    text: string;
    createdAt: string;
  }>;
});

export type SurveyCreateRequest = {
  title: string;
  description: string;
  projectId: string;
  estimatedTime: string;
  surveyType?: 'general' | 'report-form';
  startAt: string;
  endAt: string;
  sections: Section[];
  questions: AuthoredQuestion[];
  allowedRoles?: string[];
};

export type SurveyUpdateRequest = Partial<SurveyCreateRequest>;

export type SubmitAnswersRequest = {
  userId?: string | null; // optional; if omitted, backend uses auth user or anonymous
  answers: Array<{
    questionId: string;
    value?: any; // Main answer value (can be any type)
    fileInfo?: {
      fileName: string;
      fileType: string;
      fileSize: number;
      filePath: string;
    };
    metadata?: any; // Additional metadata for the answer
  }>;
};

export const surveysApi = {
  list: async (params: SurveysListParams = { page: 1, limit: 10 }): Promise<SurveysListResponse> => {
    const { page = 1, limit = 10, status, surveyType, responded, owner, allowed, startDate, endDate } = params;
    const { data } = await client.get(`/surveys`, { params: { page, limit, status, surveyType, responded, owner, allowed, startDate, endDate } });
    return data;
  },

  getById: async (surveyId: string): Promise<SurveyResponse> => {
    const { data } = await client.get(`/surveys/${surveyId}`);
    return data;
  },

  getPublicById: async (surveyId: string): Promise<SurveyResponse> => {
    const { data } = await client.get(`/surveys/public/${surveyId}`);
    return data;
  },

  create: async (payload: SurveyCreateRequest): Promise<SurveyResponse> => {
    const { data } = await client.post(`/surveys`, payload);
    return data;
  },

  update: async (surveyId: string, payload: SurveyUpdateRequest): Promise<SurveyResponse> => {
    const { data } = await client.put(`/surveys/${surveyId}`, payload);
    return data;
  },

  remove: async (surveyId: string): Promise<ServiceResponse<null>> => {
    const { data } = await client.delete(`/surveys/${surveyId}`);
    return data;
  },

  submitAnswers: async (surveyId: string, payload: SubmitAnswersRequest): Promise<SurveyResponse> => {
    const { data } = await client.post(`/surveys/${surveyId}/answers`, payload);
    return data;
  },

  // New: list responses for a survey
  responses: async (surveyId: string, page: number = 1, limit: number = 10): Promise<SurveyResponsesList> => {
    const { data } = await client.get(`/surveys/${surveyId}/responses`, { params: { page, limit } });
    return data;
  },

  // Analytics endpoints
  analytics: async (surveyId: string): Promise<ServiceResponse<SurveyAnalytics>> => {
    const { data } = await client.get(`/surveys/${surveyId}/analytics`);
    return data;
  },

  questionAnalytics: async (surveyId: string, questionId: string): Promise<ServiceResponse<QuestionAnalytics>> => {
    const { data } = await client.get(`/surveys/${surveyId}/analytics/question/${questionId}`);
    return data;
  },

};
