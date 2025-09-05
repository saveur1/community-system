import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSurvey, useSurveysList } from '@/hooks/useSurveys';
import { FaArrowLeft } from 'react-icons/fa';
import type { QuestionItem, AnswerItem } from '@/api/surveys';

export const Route = createFileRoute('/dashboard/reporting/review-report')({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: search.reportId as string,
  }),
});

function RouteComponent() {
  const { reportId } = Route.useSearch();
  const navigate = useNavigate();

  // Also fetch user's answered surveys to find user's answers for this survey (fallback)
  const { data: userAnswered, isLoading, isError } = useSurveysList({ responded: true, surveyType: undefined });

  const userAnswersAll = userAnswered?.result || [];
  const survey = userAnswersAll.find(s => s.id === reportId);
  const userSurveyAnswers = survey?.answers || [];

  // Build answer map: prefer answers included on survey.result.answers, fallback to userSurveyAnswers
  const answersList: AnswerItem[] = (survey?.answers ?? userSurveyAnswers) as AnswerItem[];

  const answerMap = answersList.reduce<Record<string, AnswerItem>>((acc, answer) => {
    if (answer && answer.questionId) acc[answer.questionId] = answer;
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
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Report form not found</h2>
        <p className="text-gray-600 mb-4">The requested report form could not be loaded.</p>
        <button
          onClick={() => navigate({ to: '/dashboard/reporting' })}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          Back to Reporting
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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

        <div className="divide-y divide-gray-200">
          {(survey.questionItems ?? []).map((question: QuestionItem, index: number) => {
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
                    {question.description && <p className="mt-1 text-sm text-gray-500">{question.description}</p>}

                    <div className="mt-4">
                      {question.type === 'single_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option} className="flex items-center">
                              <input
                                type="radio"
                                checked={answerValue === option}
                                readOnly
                                className="h-4 w-4 text-primary border-gray-300 opacity-70"
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
                                checked={Boolean(answer?.answerOptions?.includes(option))}
                                readOnly
                                className="h-4 w-4 text-primary border-gray-300 rounded opacity-70"
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
                          <div className="mt-1 block w-full rounded-md bg-gray-50 border border-gray-200 p-2 text-gray-700">
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

        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={() => navigate({ to: '/dashboard/reporting' })}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            Back to Reporting
          </button>
        </div>
      </div>
    </div>
  );
}
