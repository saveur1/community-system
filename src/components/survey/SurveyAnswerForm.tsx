import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaCheck, FaSpinner } from 'react-icons/fa';
import { useSubmitSurveyAnswers } from '@/hooks/useSurveys';
import { SubmitAnswersRequest } from '@/api/surveys';

type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';

interface QuestionItem {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  required: boolean;
  options: string[] | null;
  placeholder: string | null;
}

interface SurveyAnswerFormProps {
  onComplete: () => void;
  survey: {
    id: string;
    title: string;
    description: string;
    estimatedTime: string;
    questionItems: QuestionItem[];
  };
}

interface Answer {
  questionId: string;
  value: string | string[];
}

const SurveyAnswerForm: React.FC<SurveyAnswerFormProps> = ({ onComplete, survey }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { mutate: submitAnswers } = useSubmitSurveyAnswers(survey.id);

  // Group questions into steps (5 questions per step)
  const steps = [];
  for (let i = 0; i < survey.questionItems.length; i += 5) {
    steps.push(survey.questionItems.slice(i, i + 5));
  }

  const currentQuestions = steps[currentStep] || [];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
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
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== undefined && answer !== '';
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
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answerText: Array.isArray(answer.value) ? answer.value.join(', ') : String(answer.value),
        answerOptions: Array.isArray(answer.value) ? answer.value : undefined
      }))
    };

    submitAnswers(formattedAnswers, {
      onSuccess: () => {
        if (onComplete) onComplete();
        navigate({ to: '/dashboard/surveys/thank-you' });
      },
      onError: (error) => {
        console.error('Failed to submit answers:', error);
        // Error toast will be shown by the hook
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };

  const renderQuestion = (question: QuestionItem) => {
    const answer = answers[question.id]?.value || (question.type === 'multiple_choice' ? [] : '');

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
        <div className="mt-2 text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
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
