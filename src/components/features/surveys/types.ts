export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "text_input"
  | "textarea"
  | "file_upload"
  | "rating"
  | "linear_scale"

export interface BaseQuestion {
  id: number
  type: QuestionType
  title: string
  description: string
  required: boolean
  sectionId: string // UUID string to match section IDs
  questionNumber?: number // Added questionNumber field for continuous numbering across sections
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single_choice"
  options: string[]
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice"
  options: string[]
}

export interface TextInputQuestion extends BaseQuestion {
  type: "text_input"
  placeholder: string
}

export interface TextareaQuestion extends BaseQuestion {
  type: "textarea"
  placeholder: string
}

export interface FileUploadQuestion extends BaseQuestion {
  type: "file_upload"
  allowedTypes: string[]
  maxSize: number // in MB
}

export interface RatingQuestion extends BaseQuestion {
  type: "rating"
  maxRating: number
  ratingLabel?: string
}

export interface LinearScaleQuestion extends BaseQuestion {
  type: "linear_scale"
  minValue: number
  maxValue: number
  minLabel?: string
  maxLabel?: string
}

export type Question =
  | SingleChoiceQuestion
  | MultipleChoiceQuestion
  | TextInputQuestion
  | TextareaQuestion
  | FileUploadQuestion
  | RatingQuestion
  | LinearScaleQuestion

export interface Section {
  id: string // Changed to string to match section IDs
  title: string
  description?: string
}

export interface SurveyDraft {
  title: string
  description: string
  project: string
  estimatedTime: string
  sections: Section[] // Added sections array
  questions: Question[]
}