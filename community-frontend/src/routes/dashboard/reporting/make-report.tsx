import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useSurveysList } from '@/hooks/useSurveys';
import Breadcrumb from '@/components/ui/breadcrum';
import SurveyAnswerForm from '@/components/survey/SurveyAnswerForm';


export const Route = createFileRoute('/dashboard/reporting/make-report')({
  component: MakeReportPage,
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: search.reportId as string,
  }),
});

function MakeReportPage() {
  const navigate = useNavigate();
  const { data: surveyResp, isLoading: isLoadingSurvey, isError: isErrorSurvey } = useSurveysList({ surveyType: 'report-form', status: 'active', limit: 1, allowed: true });

  // Map backend survey data to SurveyAnswerForm expected format
  const reportSurvey = useMemo(() => {
    const survey = surveyResp?.result[0];
    if (!survey) return null;
    
    return {
      id: survey.id,
      title: survey.title,
      description: survey.description ?? '',
      estimatedTime: survey.estimatedTime ?? '0',
      questionItems: (survey.questionItems ?? []).map((q: any) => ({
        id: String(q.id),
        type: q.type,
        title: q.title,
        description: q.description ?? '',
        required: !!q.required,
        options: Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string' && q.options.trim()
            ? (() => { try { return JSON.parse(q.options); } catch { return [String(q.options)]; } })()
            : null,
        placeholder: q.placeholder ?? null,
        allowedTypes: q.allowedTypes ?? null,
        maxSize: q.maxSize ?? null,
        maxRating: q.maxRating ?? null,
        ratingLabel: q.ratingLabel ?? null,
        minValue: q.minValue ?? null,
        maxValue: q.maxValue ?? null,
        minLabel: q.minLabel ?? null,
        maxLabel: q.maxLabel ?? null,
        sectionId: q.sectionId ?? null,
      })),
      sections: survey.sections ?? [],
    };
  }, [surveyResp]);

  if (isLoadingSurvey) {
    return (
      <div>
        <Breadcrumb items={["Dashboard", "Reporting"]} title="Make Report" className='absolute top-0 left-0 w-full px-6' />
        <div className="pt-20 px-4 text-center py-20">
          <div className="text-gray-500">Loading report form…</div>
        </div>
      </div>
    );
  }

  if (isErrorSurvey || !reportSurvey) {
    return (
      <div>
        <Breadcrumb items={["Dashboard", "Reporting"]} title="Make Report" className='absolute top-0 left-0 w-full px-6' />
        <div className="pt-20 px-4 min-h-[320px] flex items-center justify-center">
          <div className="max-w-lg w-full bg-white border border-gray-300 rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">No report form available</h2>
            <p className="text-sm text-gray-600 mb-4">
              There are currently no active report forms you can submit. We'll notify you when a report form becomes available for your role.
              In the meantime, check back later or contact your administrator for further details.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate({ to: '/dashboard/reporting' })}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Back to Reporting
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleReportComplete = () => {
    navigate({ to: '/dashboard/reporting' });
  };

  return (
    <div>
      <Breadcrumb items={["Dashboard", "Reporting"]} title={reportSurvey.title || "Make Report"} className='absolute top-0 left-0 w-full px-6' />
      <div className="container mx-auto pt-20 px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate({ to: '/dashboard/reporting' })}
            className="flex items-center text-gray-600 hover:text-primary cursor-pointer transition-colors p-2 rounded-full hover:bg-gray-100 mb-4"
          >
            <FaArrowLeft className="text-xl mr-2" />
            Back to Reporting
          </button>
        </div>
        <SurveyAnswerForm
          survey={reportSurvey}
          onComplete={handleReportComplete}
        />
      </div>
    </div>
  );
}