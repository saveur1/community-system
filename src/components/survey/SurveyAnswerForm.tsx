import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaCheck, FaSpinner } from 'react-icons/fa';
import { useSubmitSurveyAnswers } from '@/hooks/useSurveys';
import { SubmitAnswersRequest } from '@/api/surveys';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';

type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea' | 'file_upload' | 'rating' | 'linear_scale';

interface QuestionItem {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[] | null;
  placeholder: string | null;
  // extras for specific types
  allowedTypes?: string[] | null;
  maxSize?: number | null;
  maxRating?: number | null;
  ratingLabel?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  minLabel?: string | null;
  maxLabel?: string | null;
  sectionId?: string | null;
}

interface SurveyAnswerFormProps {
  onComplete: () => void;
  survey: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    questionItems: QuestionItem[];
    sections?: { id: string; title: string; order?: number | null }[];
  };
}

interface Answer {
  questionId: string;
  value: string | string[] | number | File[];
}

const SurveyAnswerForm: React.FC<SurveyAnswerFormProps> = ({ onComplete, survey }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { mutate: submitAnswers } = useSubmitSurveyAnswers(survey.id);
  const { user } = useAuth();

  // Group questions by sections (each step == one section)
  const orderedSections = (survey.sections ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const steps = orderedSections.map((section) => ({
    section,
    questions: survey.questionItems.filter((q) => q.sectionId === section.id),
  })).filter((s) => s.questions.length > 0);

  const currentQuestions = steps[currentStep]?.questions || [];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswerChange = (
    questionId: string,
    value: string | string[] | number | File[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, value },
    }));
  };

  const handleNext = () => {
    // Validate required questions
    const currentRequired = currentQuestions.filter((q) => q.required);
    const allRequiredAnswered = currentRequired.every((q) => {
      const answer = answers[q.id]?.value;
      if (q.type === 'multiple_choice') {
        return Array.isArray(answer) && (answer as any[]).length > 0;
      }
      if (q.type === 'file_upload') {
        return Array.isArray(answer) && (answer as File[]).length > 0;
      }
      if (q.type === 'rating' || q.type === 'linear_scale') {
        return typeof answer === 'number' && !Number.isNaN(answer);
      }
      if (Array.isArray(answer)) return (answer as any[]).length > 0;
      return answer !== undefined && String(answer) !== '';
    });

    if (!allRequiredAnswered) {
      alert('Please answer all required questions before continuing.');
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Format answers for the API
    const formattedAnswers: SubmitAnswersRequest = {
      userId: user?.id ?? null,
      answers: (Object.entries(answers).map(([questionId, answer]) => {
        const q = survey.questionItems.find((qq) => qq.id === questionId) as QuestionItem | undefined;
        const val = answer.value;
        if (!q) {
          return { questionId, answerText: String(val ?? ''), answerOptions: undefined };
        }
        switch (q.type) {
          case 'single_choice': {
            const choice = typeof val === 'string' ? val : Array.isArray(val) ? (val[0] ?? '') : String(val ?? '');
            return { questionId, answerText: null, answerOptions: choice ? [choice] : [] };
          }
          case 'multiple_choice': {
            const arr: string[] = Array.isArray(val)
              ? (val as any[]).map((v) => String(v))
              : val
              ? [String(val)]
              : [];
            return { questionId, answerText: null, answerOptions: arr };
          }
          case 'text_input':
          case 'textarea': {
            return { questionId, answerText: String(val ?? ''), answerOptions: undefined };
          }
          case 'rating':
          case 'linear_scale': {
            const num = typeof val === 'number' ? val : Number(val);
            return { questionId, answerText: Number.isNaN(num) ? null : String(num), answerOptions: undefined };
          }
          case 'file_upload': {
            const files = Array.isArray(val) ? (val as File[]) : [];
            // Send filenames as options; real file upload is out of scope for this endpoint
            const names: string[] = files.map((f) => String(f.name));
            return { questionId, answerText: null, answerOptions: names };
          }
          default:
            return { questionId, answerText: String(val ?? ''), answerOptions: undefined };
        }
      }) as { questionId: string; answerText?: string | null; answerOptions?: string[] | null }[])
    };

    submitAnswers(formattedAnswers, {
      onSuccess: () => {
        if (onComplete) onComplete();
      },
      onError: (error) => {
        console.error('Failed to submit answers:', error);
        // Error toast will be shown by the hook
        toast.error('Failed to submit answers');
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  const renderQuestion = (question: QuestionItem) => {
    const defaultValue: any =
      question.type === 'multiple_choice' ? [] :
      question.type === 'rating' || question.type === 'linear_scale' ? undefined :
      question.type === 'file_upload' ? [] : '';
    const answer = (answers[question.id]?.value as any) ?? defaultValue;

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string) => (
              <label key={option} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={answer === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option: string) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <label key={option} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const newValue = isChecked
                        ? (answer as string[]).filter((v) => v !== option)
                        : [...(answer as string[]), option];
                      handleAnswerChange(question.id, newValue);
                    }}
                    className="h-4 w-4 text-primary outline-none focus:ring-primary"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              );
            })}
          </div>
        );

      case 'text_input':
      case 'textarea':
        return (
          <input
            type="text"
            value={answer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      case 'rating': {
        const max = question.maxRating ?? 5;
        const current = typeof answer === 'number' ? answer : 0;
        return (
          <div className="flex items-center gap-3 flex-wrap">
            {Array.from({ length: max }).map((_, i: number) => {
              const val = i + 1;
              return (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={current === val}
                    onChange={() => handleAnswerChange(question.id, Number(val))}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span className="text-gray-700">{question.ratingLabel ? `${val} ${question.ratingLabel}` : val}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'linear_scale': {
        const min = question.minValue ?? 1;
        const max = question.maxValue ?? 5;
        const current = typeof answer === 'number' ? answer : min;
        return (
          <div>
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={current}
              onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{question.minLabel ?? String(min)}</span>
              <span>{current}</span>
              <span>{question.maxLabel ?? String(max)}</span>
            </div>
          </div>
        );
      }

      case 'file_upload': {
        const accept = (question.allowedTypes ?? []).join(',');
        const files: File[] = Array.isArray(answer) ? (answer as File[]) : [];
        return (
          <div className="space-y-3">
            <input
              type="file"
              multiple
              accept={accept || undefined}
              onChange={(e) => handleAnswerChange(question.id, e.target.files ? (Array.from(e.target.files) as File[]) : ([] as File[]))}
              className="block w-full text-sm text-gray-700"
            />
            {files.length > 0 && (
              <ul className="text-sm text-gray-600 list-disc pl-5">
                {files.map((f) => (
                  <li key={f.name}>{f.name}</li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border border-gray-300 bg-white rounded-xl shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {survey.title}
        </h2>
        <p className="text-gray-600">{survey.description}</p>
        {steps[currentStep]?.section && (
          <div className="mt-3">
            <h3 className="text-lg font-medium text-gray-700">{steps[currentStep].section.title}</h3>
          </div>
        )}
        <div className="mt-2 text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {currentQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <h3 className="text-lg font-medium text-gray-800">
                {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-500 mb-3">{question.description}</p>
              )}
              {renderQuestion(question)}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-6 py-2.5 rounded-lg border ${
            currentStep === 0
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-primary text-primary hover:bg-primary/5'
          }`}
        >
          <FaArrowLeft className="mr-2" /> Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                Submit Survey <FaCheck className="ml-2" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Next <FaArrowRight className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyAnswerForm;
