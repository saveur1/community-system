import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link } from '@tanstack/react-router'
import { FaPoll } from 'react-icons/fa';
import { useSurveysList } from '@/hooks/useSurveys';
import { useSurveyResponses } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';

const SurveyComponent = () => {
    const { user } = useAuth();
    // Fetch active surveys from API

    const { data: completedResponsesResponse, isLoading: isLoadingCompleted, isError: isErrorCompleted } = useSurveyResponses(
        undefined, // surveyId - not filtering by specific survey
        user?.id, // responderId - get responses by current user
        1, // page
        -1, // limit
        "general", // surveyType
        !!user?.id // only enabled when we have user ID
    );
    const { data: activeSurveysResponse, isLoading: isLoadingActive, isError: isErrorActive } = useSurveysList({ status: 'active', surveyType: 'general', allowed: true, available: true });

    const completedResponses = (completedResponsesResponse?.result ?? [])
        .filter((response: any) => response.survey?.surveyType === 'general') // Only show general survey responses
        .map((response: any) => ({
            id: response.id,
            surveyTitle: response.survey?.title || 'Unknown Survey',
            questionCount: (response.survey?.questionItems ?? []).length,
            completedAt: response.createdAt,
            surveyId: response.survey?.id,
        }));
    
    const availableSurveys = activeSurveysResponse?.result || [];

    console.log("Available Surveys", availableSurveys);

    // Otherwise, show the list of available surveys
    return (
        <div className="">
            <Breadcrumb
                items={[
                    { title: "Dashboard", link: "/dashboard" },
                    "Available Surveys"
                ]}
                title="Available Surveys"
                className='absolute top-0 left-0 w-full'
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 pt-20">
                {isLoadingActive || isLoadingCompleted ? (
                    <div className="text-center py-4 col-span-3 text-gray-600 dark:text-gray-400">Loading available surveys...</div>
                ) : isErrorActive || isErrorCompleted ? (
                    <div className="text-center py-4 col-span-3 text-red-500 dark:text-red-400">Error loading surveys</div>
                ) : availableSurveys.length > 0 ? (
                    availableSurveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <FaPoll className="text-title dark:text-primary-200 text-2xl mr-3" />
                                <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-300">{survey.title}</h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">{survey.description}</p>
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                <span>{survey.questionItems?.length || 0} Questions</span>
                                <span>Est. {survey.estimatedTime}</span>
                            </div>
                            <Link
                                to="/dashboard/surveys/take/$survey-answer"
                                params={{ 'survey-answer': String(survey.id) }}
                                className="inline-block bg-title dark:bg-primary cursor-pointer px-4 text-white py-1.5 rounded-md hover:bg-title dark:hover:bg-primary-dark transition-colors duration-300"
                            >
                                Start Survey
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 col-span-3 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-sm drop-shadow rounded-lg border border-gray-200 dark:border-gray-700">No available surveys at the moment</div>
                )}
            </div>

            {/* Completed Surveys Section */}
            <h1 className="text-lg font-bold text-title dark:text-gray-100 mb-4">Completed Surveys</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md drop-shadow overflow-hidden overflow-x-auto border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 sm:px-6 sm:py-3 sm:text-sm bg-gray-50 dark:bg-gray-700">Survey Title</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 sm:px-6 sm:py-3 sm:text-sm max-sm:hidden bg-gray-50 dark:bg-gray-700">Completed On</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 sm:px-6 sm:py-3 sm:text-sm max-sm:hidden bg-gray-50 dark:bg-gray-700">No. of Questions</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 dark:text-gray-200 sm:px-6 sm:py-3 sm:text-sm bg-gray-50 dark:bg-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {completedResponses.length > 0 ? (
                            completedResponses.map((response) => (
                                <tr key={response.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">{response.surveyTitle}</td>
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                                        {format(parseISO(response.completedAt), 'MMM dd, yyyy h:mm a')}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                                        {response.questionCount}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 sm:px-6 sm:py-4 sm:text-sm">
                                        <Link
                                            to="/dashboard/surveys/take-survey/response/$response-id"
                                            params={{ 'response-id': response.id }}
                                            className="bg-title dark:bg-primary cursor-pointer px-4 text-white py-1.5 rounded-md hover:bg-title/90 dark:hover:bg-primary-dark transition-colors duration-300 inline-block"
                                        >
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No completed surveys yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const Route = createFileRoute('/dashboard/surveys/take-survey/')({
    component: SurveyComponent,
})