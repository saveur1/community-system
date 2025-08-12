import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute } from '@tanstack/react-router'
import { FaPoll, FaCheckCircle } from 'react-icons/fa';

const SurveyComponent = () => {
    // Sample data for surveys
    const serveysList = [
        { id: 1, title: 'Customer Satisfaction Survey', description: 'Share your experience with our services', questions: 10, time: '5 min' },
        { id: 2, title: 'Product Feedback', description: 'Help us improve our products', questions: 8, time: '4 min' },
        { id: 3, title: 'User Experience Survey', description: 'Tell us about your app usage', questions: 12, time: '6 min' },
    ];

    const completedSurveys = [
        { id: 1, title: 'Website Usability', date: '2025-08-01', score: 85 },
        { id: 2, title: 'Service Quality Feedback', date: '2025-07-25', score: 90 },
    ];

    return (
        <div className="">
            <Breadcrumb 
                items={["Community", "Available Surveys"]}
                title="Available Surveys"
                className='absolute top-0 left-0 w-full'
            />

            <div className="flex w-full pt-14">
                <h2 className="text-gray-600 text-base"></h2>
                <div className="flex-1"></div>
                <div className="flex items-center gap-2">

                    <button className="bg-primary text-white px-5 py-2 rounded-md hover:bg-primary-dark cursor-pointer transition-colors text-center font-medium shadow-sm">
                        Create Survey
                    </button>
                </div>
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

export const Route = createFileRoute('/dashboard/surveys/')({
    component: SurveyComponent,
})