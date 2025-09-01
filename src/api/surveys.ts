// src/api/surveys.ts
import { client } from './client';

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
export type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';

export type AuthoredChoiceQuestion = {
  id: number;
  type: 'single_choice' | 'multiple_choice';
  title: string;
  description: string;
  required: boolean;
  options: string[];
};

export type AuthoredTextQuestion = {
  id: number;
  type: 'text_input' | 'textarea';
  title: string;
  description: string;
  required: boolean;
  placeholder: string;
};

export type AuthoredQuestion = AuthoredChoiceQuestion | AuthoredTextQuestion;

export type QuestionItem = {
  id: string;
  surveyId: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[] | null;
  placeholder: string | null;
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

export type SurveyEntity = {
  id: string;
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  status: 'active' | 'paused' | 'archived';
  questions: AuthoredQuestion[]; // JSON array as authored in UI
  createdAt?: string;
  updatedAt?: string;
  // included relations
  questionItems?: QuestionItem[];
  answers?: AnswerItem[];
};

export type SurveysListParams = { page?: number; limit?: number; status?: 'active' | 'paused' | 'archived' };
export type SurveysListResponse = ServiceResponse<SurveyEntity[]>;
export type SurveyResponse = ServiceResponse<SurveyEntity>;

export type SurveyCreateRequest = {
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  questions: AuthoredQuestion[];
};

export type SurveyUpdateRequest = Partial<SurveyCreateRequest>;

export type SubmitAnswersRequest = {
  answers: Array<{
    questionId: string;
    answerText?: string | null;
    answerOptions?: string[] | null;
  }>;
};

export const surveysApi = {
  list: async (params: SurveysListParams = { page: 1, limit: 10 }): Promise<SurveysListResponse> => {
    const { page = 1, limit = 10, status } = params;
    const { data } = await client.get(`/surveys`, { params: { page, limit, status } });
    return data;
  },

  getById: async (surveyId: string): Promise<SurveyResponse> => {
    const { data } = await client.get(`/surveys/${surveyId}`);
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

  // New: fetch surveys (with answers) completed by current user
  userAnswers: async (): Promise<SurveysListResponse> => {
    const { data } = await client.get(`/surveys/user-answers`);
    return data;
  },
};
