import { createFileRoute, Link } from '@tanstack/react-router';
import { FaHourglassHalf } from 'react-icons/fa';

export const Route = createFileRoute('/(home-routes)/approval-required')({
  component: ApprovalRequiredComponent,
});

function ApprovalRequiredComponent() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
        <FaHourglassHalf className="text-primary/50 text-8xl mb-6" />
        <h1 className="text-4xl font-bold text-title mb-2">Approval Required</h1>
        <p className="text-lg text-gray-600 max-w-md mb-8">
          Your account has been created successfully, but it requires administrator approval before you can access the dashboard. You will be notified once your account is approved.
        </p>
        <Link
          to="/auth/login"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </>
  );
}
