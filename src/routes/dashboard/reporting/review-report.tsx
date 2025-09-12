import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSurvey, useSurveysList } from '@/hooks/useSurveys';
import { FaArrowLeft } from 'react-icons/fa';
import type { QuestionItem, AnswerItem } from '@/api/surveys';
import SurveyAnswerReview from '@/components/survey/SurveyAnswerReview';

export const Route = createFileRoute('/dashboard/reporting/review-report')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: search.reportId as string,
  }),
});

function RouteComponent() {
  const { reportId } = Route.useSearch();
  const navigate = useNavigate();

  // Fetch user's answered surveys to find user's answers for this survey (report)
  const { data: userAnswered, isLoading, isError } = useSurveysList({ responded: true, surveyType: undefined });

  const userAnswersAll = userAnswered?.result || [];
  const survey = userAnswersAll.find(s => s.id === reportId);
  const userSurveyAnswers = survey?.answers || [];

  // Build answer list: prefer answers included on survey.result.answers, fallback to userSurveyAnswers
  const answersList: AnswerItem[] = (survey?.answers ?? userSurveyAnswers) as AnswerItem[];

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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Report form not found</h2>
        <p className="text-gray-600 mb-4">The requested report form could not be loaded.</p>
        <button
          onClick={() => navigate({ to: '/dashboard/reporting' })}
          className="px-4 py-2 bg-primary/30 text-white rounded-md hover:bg-primary-dark/30 transition-colors"
        >
          Back to Reporting
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
              onClick={() => navigate({ to: '/dashboard/reporting' })}
              className="mr-4 text-gray-600 hover:text-primary cursor-pointer transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          </div>
          <p className="text-gray-600">{survey.description}</p>
          <div className="mt-2 text-sm text-gray-500 italic">
            Completed on: {new Date(answersList[0]?.createdAt || new Date()).toLocaleDateString()}
          </div>
        </div>
        
        {/* Questions */}
        <SurveyAnswerReview 
          questions={survey?.questionItems || []}
          answers={answersList}
        />
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={() => navigate({ to: '/dashboard/reporting' })}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/40"
          >
            Back to Reporting
          </button>
        </div>
      </div>
    </div>
  );
}
