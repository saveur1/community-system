export interface BaseQuestion {
  id: number;
  type: 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';
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

export type Question = ChoiceQuestion | TextQuestion;

export interface SurveyDraft {
  title: string;
  description: string;
  project: string;
  estimatedTime: string;
  status?: 'active' | 'paused' | 'archived';
  questions: Question[];
}

export interface QuestionTypeMeta {
  id: Question['type'];
  label: string;
  icon: string;
}

