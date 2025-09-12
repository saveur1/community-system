import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSurvey, useSurveyResponses } from '@/hooks/useSurveys';
import { FaArrowLeft } from 'react-icons/fa';
import useAuth from '@/hooks/useAuth';
import SurveyAnswerReview from '@/components/survey/SurveyAnswerReview';

export const Route = createFileRoute('/dashboard/surveys/review-survey')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    surveyId: search.surveyId as string,
  }),
});

function RouteComponent() {
  const { surveyId } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fetch the survey with questions
  const { data: surveyResponse, isLoading, isError } = useSurvey(surveyId, true);
  const survey = surveyResponse?.result;
  
  // Fetch responses for this survey and pick the current user's response
  const { data: responsesData } = useSurveyResponses(surveyId, 1, 500, true);
  const responses = responsesData?.result ?? [];
  const myResponse = responses.find((r: any) => r.user?.id && r.user.id === user?.id) || null;
  const myAnswers = myResponse?.answers ?? [];
  
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
          {myResponse && (
            <div className="mt-2 text-sm text-gray-500 italic">
              Completed on: {new Date(myResponse.createdAt || new Date()).toLocaleDateString()}
            </div>
          )}
        </div>
        
        {/* Questions */}
        <SurveyAnswerReview 
          questions={survey?.questionItems || []}
          answers={myAnswers}
        />
        
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
