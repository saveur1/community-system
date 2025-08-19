import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute } from '@tanstack/react-router'
import { FaPoll, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import SurveyAnswerForm from "@/components/survey/SurveyAnswerForm";

const SurveyComponent = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

    const handleStartSurvey = (surveyId: string) => {
        setSelectedSurveyId(surveyId);
        // Optional: Scroll to the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSurveyComplete = () => {
        // Reset selected survey and navigate to thank you page
        setSelectedSurveyId(null);
        navigate({ to: '/community/surveys/thank-you' });
    };

    const handleBackToList = () => {
        setSelectedSurveyId(null);
    };

    // Sample data for surveys
    const availableSurveys = [
        { 
            id: 'customer-satisfaction-2023', 
            title: 'Customer Satisfaction Survey', 
            description: 'Share your experience with our services', 
            questions: 10, 
            time: '5 min' 
        },
        { 
            id: 'maternal-health-2023',
            title: 'Maternal Health Survey',
            description: 'Share your experience with maternal healthcare services in your community.',
            questions: 10,
            time: '10 min',
        },
        {
            id: 'child-immunization-2023',
            title: 'Child Immunization Feedback',
            description: 'Help us improve our child immunization program by sharing your feedback.',
            questions: 12,
            time: '8 min',
        },
    ];

    // Sample data for completed surveys
    const completedSurveys = [
        { id: 'product-feedback-2023', title: 'Product Feedback', date: '2025-08-10', score: 85 },
        { id: 'service-quality-2023', title: 'Service Quality Feedback', date: '2025-07-25', score: 90 },
    ];

    // If a survey is selected, show the form
    if (selectedSurveyId) {
        const survey = availableSurveys.find(s => s.id === selectedSurveyId);
        return (
            <div>
            <Breadcrumb 
                items={["Community", "Surveys"]}
                title="Survey"
                className='absolute top-0 left-0 w-full'
            />
            <div className="container mx-auto pt-20 px-4 py-8">
                <SurveyAnswerForm onComplete={handleSurveyComplete} />
            </div>
            </div>
        );
    }

    // Otherwise, show the list of available surveys
    return (
        <div className="">
            <Breadcrumb 
                items={["Community", "Available Surveys"]}
                title="Available Surveys"
                className='absolute top-0 left-0 w-full'
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 pt-20">
                {availableSurveys.map((survey) => (
                    <div
                        key={survey.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="flex items-center mb-4">
                            <FaPoll className="text-primary text-2xl mr-3" />
                            <h2 className="text-lg font-semibold text-gray-600">{survey.title}</h2>
                        </div>
                        <p className="text-gray-600 mb-4">{survey.description}</p>
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                            <span>{survey.questions} Questions</span>
                            <span>Est. {survey.time}</span>
                        </div>
                        <button 
                          onClick={() => handleStartSurvey(survey.id)}
                          className="bg-primary cursor-pointer px-4 text-white py-1.5 rounded-md hover:bg-primary-dark transition-colors duration-300"
                        >
                          Start Survey
                        </button>
                    </div>
                ))}
            </div>

            {/* Completed Surveys Section */}
            <h1 className="text-lg font-bold text-title mb-4">Completed Surveys</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Survey Title</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Completed On</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {completedSurveys.length > 0 ? (
                            completedSurveys.map((survey) => (
                                <tr key={survey.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-700">{survey.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{survey.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        <div className="flex items-center">
                                            <FaCheckCircle className="text-green-500 mr-2" />
                                            {survey.score}%
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
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

export const Route = createFileRoute('/dashboard/surveys/take-survey')({
    component: SurveyComponent,
})