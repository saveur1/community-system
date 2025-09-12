import React from 'react';
import type { QuestionItem } from '@/api/surveys';

interface SurveyAnswer {
  questionId: string;
  answerText?: string | null;
  answerOptions?: string[] | null;
}

interface SurveyAnswerReviewProps {
  questions: QuestionItem[];
  answers: SurveyAnswer[];
  className?: string;
}

const SurveyAnswerReview: React.FC<SurveyAnswerReviewProps> = ({
  questions,
  answers,
  className = '',
}) => {
  // Create a map of questionId to answer for easy lookup
  const answerMap = answers.reduce<Record<string, { answerText: string | null; answerOptions: string[] | null }>>((acc: any, answer: any) => {
    if (answer.questionId) {
      acc[answer.questionId] = { answerText: answer.answerText ?? null, answerOptions: parseOptions(answer.answerOptions) ?? null };
    }
    return acc;
  }, {});

  const parseOptions = (options: any): string[] => {
    try {
      if (typeof options === 'string') {
        return JSON.parse(options);
      } else if (Array.isArray(options)) {
        return options;
      }
    } catch (e) {
      console.warn('Failed to parse options:', e);
    }
    return [];
  };

  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {questions.map((question: QuestionItem, index: number) => {
        const answer = answerMap[question.id];
        const answerValue = answer?.answerText || (parseOptions(answer?.answerOptions) || []).join(', ');
        const parsedOptions = parseOptions(question.options);

        return (
          <div key={question.id} className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/30 text-white text-sm font-medium mr-3 mt-1">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </h3>
                {question.description && (
                  <p className="mt-1 text-sm text-gray-500">{question.description}</p>
                )}
                <div className="mt-4">
                  {question.type === 'single_choice' && parsedOptions.length > 0 && (
                    <div className="space-y-2">
                      {parsedOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input 
                            type="radio" 
                            checked={answerValue === option} 
                            readOnly 
                            className="h-4 w-4 text-primary/30 border-gray-300 opacity-60" 
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">{option}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {question.type === 'multiple_choice' && parsedOptions.length > 0 && (
                    <div className="space-y-2">
                      {parsedOptions.map((option) => (
                        <div key={option} className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={answer?.answerOptions?.includes(option) || false} 
                            readOnly 
                            className="h-4 w-4 text-primary/30 border-gray-300 rounded opacity-60" 
                          />
                          <label className="ml-3 block text-sm font-medium text-gray-700">{option}</label>
                        </div>
                      ))}
                    </div>
                  )}
                  {(question.type === 'text_input' || question.type === 'textarea') && (
                    <div className="mt-1">
                      <div className="mt-1 block w-full rounded-md bg-gray-50 border-gray-200 border p-2 text-gray-700">
                        {answerValue || 'No answer provided'}
                      </div>
                    </div>
                  )}
                  {question.type === 'file_upload' && (
                    <div className="mt-1">
                      {(answer?.answerOptions?.length ?? 0) > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {answer?.answerOptions?.map((name: string) => (
                            <span key={name} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No files uploaded</div>
                      )}
                    </div>
                  )}
                  {question.type === 'rating' && (
                    <div className="mt-1 text-sm text-gray-700">
                      Rating: <span className="font-medium">{answer?.answerText ?? '—'}</span>
                      {question.ratingLabel ? ` ${question.ratingLabel}` : ''}
                    </div>
                  )}
                  {question.type === 'linear_scale' && (
                    <div className="mt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{question.minLabel ?? question.minValue}</span>
                        <input 
                          type="range" 
                          min={question.minValue ?? 1} 
                          max={question.maxValue ?? 5} 
                          step={1} 
                          value={Number(answer?.answerText ?? question.minValue ?? 1)} 
                          readOnly 
                          className="w-full" 
                        />
                        <span className="text-xs text-gray-500">{question.maxLabel ?? question.maxValue}</span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        Selected: <span className="font-medium">{answer?.answerText ?? '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveyAnswerReview;
