import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSurvey } from '@/hooks/useSurveys';
import { useUserSurveyAnswers } from '@/hooks/useSurveys';
import { FaArrowLeft } from 'react-icons/fa';
import type { SurveyEntity, QuestionItem, AnswerItem } from '@/api/surveys';

export const Route = createFileRoute('/dashboard/surveys/review-survey')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    surveyId: search.surveyId as string,
  }),
});

function RouteComponent() {
  const { surveyId } = Route.useSearch();
  const navigate = useNavigate();
  
  // Fetch the survey with questions and answers
  const { data: surveyResponse, isLoading, isError } = useSurvey(surveyId, true);
  const survey = surveyResponse?.result;
  
  // Get user's answers for this survey
  const { data: userAnswers } = useUserSurveyAnswers(true);
  const userSurveyAnswers = userAnswers?.result?.find(s => s.id === surveyId)?.answers || [];
  
  // Create a map of questionId to answer for easy lookup
  const answerMap = userSurveyAnswers.reduce<Record<string, AnswerItem>>((acc, answer) => {
    if (answer.questionId) {
      acc[answer.questionId] = answer;
    }
    return acc;
  }, {});
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary/40"></div>
      </div>
    );
  }
  
  if (isError || !survey) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Survey not found</h2>
        <p className="text-gray-600 mb-4">The requested survey could not be loaded.</p>
        <button 
          onClick={() => navigate({ to: '/dashboard/surveys/take-survey' })}
          className="px-4 py-2 bg-primary/30 text-white rounded-md hover:bg-primary-dark/30 transition-colors"
        >
          Back to Surveys
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white drop-shadow-2xl rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => navigate({ to: '/dashboard/surveys/take-survey' })}
              className="mr-4 text-gray-600 hover:text-primary cursor-pointer transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{survey?.title}</h1>
          </div>
          <p className="text-gray-600">{survey?.description}</p>
          <div className="mt-2 text-sm text-gray-500 italic">
            Completed on: {new Date(userSurveyAnswers[0]?.createdAt || new Date()).toLocaleDateString()}
          </div>
        </div>
        
        {/* Questions */}
        <div className="divide-y divide-gray-200">
          {survey?.questionItems?.map((question: QuestionItem, index: number) => {
            const answer = answerMap[question.id];
            const answerValue = answer?.answerText || (answer?.answerOptions || []).join(', ');
            
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
                      {question.type === 'single_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={answerValue === option}
                                readOnly
                                className="h-4 w-4 text-primary/30 border-gray-300 opacity-60"
                              />
                              <label className="ml-3 block text-sm font-medium text-gray-700">
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={answer?.answerOptions?.includes(option) || false}
                                readOnly
                                className="h-4 w-4 text-primary/30 border-gray-300 rounded opacity-60"
                              />
                              <label className="ml-3 block text-sm font-medium text-gray-700">
                                {option}
                              </label>
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={() => navigate({ to: '/dashboard/surveys/take-survey' })}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
          >
            Back to Surveys
          </button>
        </div>
      </div>
    </div>
  );
}
