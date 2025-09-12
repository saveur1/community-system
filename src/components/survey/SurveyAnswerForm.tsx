import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaArrowLeft, FaCheck, FaSpinner, FaStar, FaUpload, FaTimes } from 'react-icons/fa';
import { useSubmitSurveyAnswers } from '@/hooks/useSurveys';
import { SubmitAnswersRequest } from '@/api/surveys';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import { uploadToCloudinary } from '@/utility/logicFunctions';

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
  value: string | string[] | number | UploadedFile[];
  fileInfo?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
  };
  metadata?: any;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  publicId: string;
  deleteToken?: string;
  uploading?: boolean;
  uploadProgress?: number;
}

const SurveyAnswerForm: React.FC<SurveyAnswerFormProps> = ({ onComplete, survey }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
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
    value: string | string[] | number | UploadedFile[]
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, value },
    }));
  };

  const handleFileUpload = async (questionId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [questionId]: true }));
    
    try {
      const currentFiles = (answers[questionId]?.value as UploadedFile[]) || [];
      const uploadPromises = Array.from(files).map(async (file) => {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        
        // Add file with uploading state
        const uploadingFile: UploadedFile = {
          id: tempId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
          publicId: '',
          uploading: true,
          uploadProgress: 0
        };
        
        // Update UI immediately with uploading file
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            questionId,
            value: [...currentFiles, uploadingFile]
          }
        }));

        try {
          const result = await uploadToCloudinary(file, {
            folder: 'survey-uploads',
            onProgress: (percent) => {
              setAnswers(prev => {
                const currentAnswer = prev[questionId];
                if (currentAnswer && Array.isArray(currentAnswer.value)) {
                  const updatedFiles = (currentAnswer.value as UploadedFile[]).map(f => 
                    f.id === tempId ? { ...f, uploadProgress: percent } : f
                  );
                  return {
                    ...prev,
                    [questionId]: { ...currentAnswer, value: updatedFiles }
                  };
                }
                return prev;
              });
            }
          });

          const uploadedFile: UploadedFile = {
            id: result.publicId,
            name: result.originalFilename || file.name,
            size: result.bytes,
            type: result.format || file.type,
            url: result.secureUrl,
            publicId: result.publicId,
            deleteToken: result.deleteToken,
            uploading: false
          };

          // Replace uploading file with uploaded file
          setAnswers(prev => {
            const currentAnswer = prev[questionId];
            if (currentAnswer && Array.isArray(currentAnswer.value)) {
              const updatedFiles = (currentAnswer.value as UploadedFile[]).map(f => 
                f.id === tempId ? uploadedFile : f
              );
              return {
                ...prev,
                [questionId]: { ...currentAnswer, value: updatedFiles }
              };
            }
            return prev;
          });

          return uploadedFile;
        } catch (error) {
          console.error('Upload failed:', error);
          toast.error(`Failed to upload ${file.name}`);
          
          // Remove failed upload from UI
          setAnswers(prev => {
            const currentAnswer = prev[questionId];
            if (currentAnswer && Array.isArray(currentAnswer.value)) {
              const updatedFiles = (currentAnswer.value as UploadedFile[]).filter(f => f.id !== tempId);
              return {
                ...prev,
                [questionId]: { ...currentAnswer, value: updatedFiles }
              };
            }
            return prev;
          });
          
          throw error;
        }
      });

      await Promise.allSettled(uploadPromises);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const removeFile = (questionId: string, fileId: string) => {
    setAnswers(prev => {
      const currentAnswer = prev[questionId];
      if (currentAnswer && Array.isArray(currentAnswer.value)) {
        const updatedFiles = (currentAnswer.value as UploadedFile[]).filter(f => f.id !== fileId);
        return {
          ...prev,
          [questionId]: { ...currentAnswer, value: updatedFiles }
        };
      }
      return prev;
    });
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
        return Array.isArray(answer) && (answer as UploadedFile[]).length > 0;
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
      answers: Object.entries(answers).map(([questionId, answer]) => {
        const q = survey.questionItems.find((qq) => qq.id === questionId) as QuestionItem | undefined;
        const val = answer.value;
        
        if (!q) {
          return { questionId, value: String(val ?? '') };
        }

        const baseAnswer = {
          questionId,
          value: val,
          ...(answer.fileInfo && { fileInfo: answer.fileInfo }),
          ...(answer.metadata && { metadata: answer.metadata })
        };

        switch (q.type) {
          case 'single_choice': {
            // For single choice, send the selected option as a string
            const choice = typeof val === 'string' ? val : Array.isArray(val) ? (val[0] ?? '') : String(val ?? '');
            return { ...baseAnswer, value: choice };
          }
          case 'multiple_choice': {
            // For multiple choice, send array of selected options
            const arr: string[] = Array.isArray(val)
              ? (val as any[]).map((v) => String(v)) || []
              : val
              ? [String(val)]
              : [];
            return { ...baseAnswer, value: arr };
          }
          case 'text_input':
          case 'textarea': {
            // For text inputs, send as string
            return { ...baseAnswer, value: String(val ?? '') };
          }
          case 'rating':
          case 'linear_scale': {
            // For numeric inputs, send as number
            const num = typeof val === 'number' ? val : Number(val);
            return { ...baseAnswer, value: Number.isNaN(num) ? null : num };
          }
          case 'file_upload': {
            const files = val as UploadedFile[];
            if (files && files.length > 0) {
              // For multiple files, we'll store them as an array in the backend
              return {
                ...baseAnswer,
                value: files.map(file => ({
                  fileName: file.name,
                  fileType: file.type,
                  fileSize: file.size,
                  fileUrl: file.url,
                  publicId: file.publicId,
                  deleteToken: file.deleteToken
                }))
              };
            }
            return { ...baseAnswer, value: null };
          }
          default:
            return { ...baseAnswer, value: String(val ?? '') };
        }
      })
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
        let singleOptions: string[] = [];
        try {
          if (typeof (question as any).options === 'string') {
            singleOptions = JSON.parse((question as any).options);
          } else if (Array.isArray((question as any).options)) {
            singleOptions = (question as any).options;
          }
        } catch (e) {
          console.warn('Failed to parse options for question:', question.id, e);
          singleOptions = [];
        }
        return (
          <div className="space-y-2">
            {singleOptions.map((option: string) => (
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
        let multipleOptions: string[] = [];
        try {
          if (typeof (question as any).options === 'string') {
            multipleOptions = JSON.parse((question as any).options);
          } else if (Array.isArray((question as any).options)) {
            multipleOptions = (question as any).options;
          }
        } catch (e) {
          console.warn('Failed to parse options for question:', question.id, e);
          multipleOptions = [];
        }
        return (
          <div className="space-y-2">
            {multipleOptions.map((option: string) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <label key={option} className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const newValue = isChecked
                        ? (answer as string[]).filter((v) => v !== option)
                        : [...(Array.isArray(answer) ? answer : []), option];
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
        return (
          <input
            type="text"
            value={answer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer here...'}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={answer as string}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Type your answer here...'}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
          />
        );

      case 'rating': {
        const max = question.maxRating ?? 5;
        const current = typeof answer === 'number' ? answer : 0;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: max }).map((_, i: number) => {
                const val = i + 1;
                const isActive = val <= current;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAnswerChange(question.id, Number(val))}
                    className={`p-1 transition-colors ${
                      isActive ? 'text-primary' : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <FaStar className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
            {current > 0 && (
              <div className="text-sm text-gray-600">
                {question.ratingLabel ? `${current} ${question.ratingLabel}` : `${current} out of ${max} stars`}
              </div>
            )}
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
        const files: UploadedFile[] = Array.isArray(answer) ? (answer as UploadedFile[]) : [];
        const isUploading = uploadingFiles[question.id] || false;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <div className="flex flex-col items-center justify-center pt-3 pb-3">
                  {isUploading ? (
                    <FaSpinner className="w-6 h-6 mb-2 text-gray-500 animate-spin" />
                  ) : (
                    <FaUpload className="w-6 h-6 mb-2 text-gray-500" />
                  )}
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">
                      {isUploading ? 'Uploading...' : 'Click to upload'}
                    </span>
                    {!isUploading && ' or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.allowedTypes?.length ? question.allowedTypes.join(', ').toUpperCase() : 'Any file type'}
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept={accept || undefined}
                  onChange={(e) => handleFileUpload(question.id, e.target.files)}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Uploaded files:</p>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li key={file.id} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{file.name}</span>
                          {file.uploading && (
                            <FaSpinner className="w-3 h-3 animate-spin text-primary" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(file.size / 1024).toFixed(1)} KB
                          {file.uploading && file.uploadProgress !== undefined && (
                            <span className="ml-2">({file.uploadProgress}%)</span>
                          )}
                        </div>
                        {file.uploading && file.uploadProgress !== undefined && (
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all duration-300" 
                              style={{ width: `${file.uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {!file.uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(question.id, file.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 border border-gray-200 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {survey.title}
        </h2>
        <p className="text-gray-600 text-lg mb-6">{survey.description}</p>
        
        {/* Steps Indicator with Badge Numbers */}
        <div className="flex justify-center items-center space-x-4 mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
                  index <= currentStep
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={`w-12 h-1 mx-2 rounded-full ${
                    index < currentStep ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500 text-center mb-4">
          Step {currentStep + 1} of {totalSteps}
        </div>
        
        {/* Section Title Below Steps Indicator */}
        {steps[currentStep]?.section && (
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 bg-gray-100 py-3 px-6 rounded-lg border border-gray-300">
              {steps[currentStep].section.title}
            </h3>
          </div>
        )}
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
          {currentQuestions.map((question, questionIndex) => {
            // Calculate global question number across all steps
            let globalQuestionNumber = 1;
            for (let i = 0; i < currentStep; i++) {
              globalQuestionNumber += steps[i]?.questions.length || 0;
            }
            globalQuestionNumber += questionIndex;
            
            return (
              <div key={question.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                      {globalQuestionNumber}
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {question.description && (
                      <p className="text-sm text-gray-600">{question.description}</p>
                    )}
                    <div className="pt-2">
                      {renderQuestion(question)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center px-8 py-3 rounded-lg border font-medium transition-all duration-200 ${
            currentStep === 0
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              : 'border-primary text-primary hover:bg-primary/10 hover:shadow-md'
          }`}
        >
          <FaArrowLeft className="mr-2" /> Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="flex items-center px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Next <FaArrowRight className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SurveyAnswerForm;
