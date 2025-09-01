import { createFileRoute, Link } from '@tanstack/react-router';
import { FaCheckCircle } from 'react-icons/fa';

export const Route = createFileRoute('/dashboard/surveys/thank-you')({
  component: SurveyThankYou,
});

function SurveyThankYou() {
  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl drop-shadow-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <FaCheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
        <p className="text-gray-600 mb-8">
          Your responses have been recorded. We appreciate your time and feedback!
        </p>
        <Link
          to="/dashboard/surveys/take-survey"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Back to Surveys
        </Link>
      </div>
    </div>
  );
}

export default SurveyThankYou;
