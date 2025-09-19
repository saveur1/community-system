import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { FaPoll } from 'react-icons/fa';
import { useSurveysList } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';

const SurveyComponent = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    // Fetch active surveys from API

    const { data: completedSurveysResponse, isLoading: isLoadingCompleted, isError: isErrorCompleted } = useSurveysList({ surveyType: "general", responded: true });
    const { data: activeSurveysResponse, isLoading: isLoadingActive, isError: isErrorActive } = useSurveysList({ status: 'active', surveyType: 'general', allowed: true });

    const completedSurveys = completedSurveysResponse?.result || [];
    const completedSurveyIds = new Set(completedSurveys.map(s => s.id));

    const availableSurveys = (activeSurveysResponse?.result || []).filter(survey =>
        !completedSurveyIds.has(survey.id)
    );

    console.log("availableSurveys", availableSurveys);

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
                    <div className="text-center py-4 col-span-3">Loading available surveys...</div>
                ) : isErrorActive || isErrorCompleted ? (
                    <div className="text-center py-4 col-span-3 text-red-500">Error loading surveys</div>
                ) : availableSurveys.length > 0 ? (
                    availableSurveys.map((survey) => (
                        <div
                            key={survey.id}
                            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <FaPoll className="text-title text-2xl mr-3" />
                                <h2 className="text-lg font-semibold text-gray-600">{survey.title}</h2>
                            </div>
                            <p className="text-gray-600 mb-4">{survey.description}</p>
                            <div className="flex justify-between text-sm text-gray-500 mb-4">
                                <span>{survey.questionItems?.length || 0} Questions</span>
                                <span>Est. {survey.estimatedTime}</span>
                            </div>
                            <Link
                                to="/dashboard/surveys/take/$survey-answer"
                                params={{ 'survey-answer': String(survey.id) }}
                                className="inline-block bg-title cursor-pointer px-4 text-white py-1.5 rounded-md hover:bg-title transition-colors duration-300"
                            >
                                Start Survey
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 col-span-3 text-gray-500 bg-white shadow-sm drop-shadow rounded-lg">No available surveys at the moment</div>
                )}
            </div>

            {/* Completed Surveys Section */}
            <h1 className="text-lg font-bold text-title mb-4">Completed Surveys</h1>
            <div className="bg-white rounded-lg shadow-md drop-shadow overflow-hidden overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 sm:px-6 sm:py-3 sm:text-sm">Survey Title</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">Completed On</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 sm:px-6 sm:py-3 sm:text-sm max-sm:hidden">No. of Questions</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-800 sm:px-6 sm:py-3 sm:text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {completedSurveys.length > 0 ? (
                            completedSurveys.map((survey) => (
                                <tr key={survey.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm">{survey.title}</td>
                                    <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                                        {new Date(survey.responses?.find((response) => response.userId == user?.id)?.createdAt || '').toLocaleDateString()}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm max-sm:hidden">
                                        {survey.questionItems?.length || 0}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 sm:px-6 sm:py-4 sm:text-sm">
                                        <button
                                            onClick={() => navigate({
                                                to: '/dashboard/surveys/review-survey',
                                                search: { surveyId: survey.id }
                                            })}
                                            className="bg-title cursor-pointer px-4 text-white py-1.5 rounded-md hover:bg-title/90 transition-colors duration-300"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
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