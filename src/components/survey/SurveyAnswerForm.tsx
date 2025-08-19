import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaCheck } from 'react-icons/fa';

// Mock survey data
const mockSurvey = {
  id: 'maternal-health-2023',
  title: 'Maternal Health Survey',
  description: 'Help us improve maternal healthcare services in your community',
  estimatedTime: '10 minutes',
  questions: [
    // Step 1 - Personal Information
    {
      id: 1,
      type: 'text_input',
      title: 'What is your age?',
      description: 'Please enter your age in years',
      required: true,
      placeholder: 'Enter your age',
    },
    {
      id: 2,
      type: 'single_choice',
      title: 'What is your gender?',
      description: 'Please select your gender identity',
      required: true,
      options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'],
    },
    {
      id: 3,
      type: 'single_choice',
      title: 'How many children do you have?',
      description: 'Include all biological children',
      required: true,
      options: ['0', '1', '2', '3', '4', '5+'],
    },
    {
      id: 4,
      type: 'single_choice',
      title: 'What is your highest level of education?',
      required: true,
      options: [
        'No formal education',
        'Primary school',
        'Secondary school',
        'Vocational training',
        'University degree',
        'Postgraduate degree',
      ],
    },
    {
      id: 5,
      type: 'single_choice',
      title: 'What is your current employment status?',
      required: true,
      options: [
        'Employed full-time',
        'Employed part-time',
        'Self-employed',
        'Unemployed',
        'Student',
        'Homemaker',
        'Retired',
      ],
    },
    // Step 2 - Healthcare Access
    {
      id: 6,
      type: 'single_choice',
      title: 'How far is the nearest healthcare facility from your home?',
      required: true,
      options: [
        'Less than 1 km',
        '1-5 km',
        '5-10 km',
        'More than 10 km',
        "I don't know",
      ],
    },
    {
      id: 7,
      type: 'single_choice',
      title: 'How do you usually travel to the healthcare facility?',
      required: true,
      options: [
        'On foot',
        'Bicycle/motorcycle',
        'Public transportation',
        'Private vehicle',
        'Ambulance/emergency transport',
      ],
    },
    {
      id: 8,
      type: 'single_choice',
      title: 'How long does it take you to reach the nearest healthcare facility?',
      required: true,
      options: [
        'Less than 15 minutes',
        '15-30 minutes',
        '30-60 minutes',
        '1-2 hours',
        'More than 2 hours',
      ],
    },
    {
      id: 9,
      type: 'multiple_choice',
      title: 'What are the main challenges you face in accessing healthcare services?',
      description: 'Select all that apply',
      required: false,
      options: [
        'Long distance to facility',
        'High transportation costs',
        'Lack of transportation',
        'Long waiting times',
        'Shortage of healthcare providers',
        'Cost of services',
        'Language/cultural barriers',
        'Other (please specify)',
      ],
    },
    {
      id: 10,
      type: 'single_choice',
      title: 'Do you have health insurance?',
      required: true,
      options: ['Yes', 'No', "I don't know"],
    },
    // Add more steps as needed
  ],
};

interface Answer {
  questionId: number;
  value: string | string[];
}

const SurveyAnswerForm: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const navigate = useNavigate();

  // Group questions into steps (5 questions per step)
  const steps = [];
  for (let i = 0; i < mockSurvey.questions.length; i += 5) {
    steps.push(mockSurvey.questions.slice(i, i + 5));
  }

  const currentQuestions = steps[currentStep] || [];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  const handleAnswerChange = (questionId: number, value: string | string[]) => {
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
    console.log('Survey answers:', Object.values(answers));
    // Here you would typically send the answers to your API
    if (onComplete) onComplete();
    navigate({ to: '/community/surveys/thank-you' });
  };

  const renderQuestion = (question: any) => {
    const answer = answers[question.id]?.value || (question.type === 'multiple_choice' ? [] : '');

    switch (question.type) {
      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options.map((option: string) => (
              <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
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
            {question.options.map((option: string) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <label key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const newValue = isChecked
                        ? (answer as string[]).filter((v) => v !== option)
                        : [...(answer as string[]), option];
                      handleAnswerChange(question.id, newValue);
                    }}
                    className="h-4 w-4 text-primary focus:ring-primary"
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border border-gray-300 bg-white rounded-xl shadow-md">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{mockSurvey.title}</h1>
        <p className="text-gray-600">{mockSurvey.description}</p>
        <div className="mt-4 text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps} • Approximately {mockSurvey.estimatedTime}
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
            Submit Survey <FaCheck className="ml-2" />
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
