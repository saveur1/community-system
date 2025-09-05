import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useSubmitSurveyAnswers, useSurveysList } from '@/hooks/useSurveys';
import useAuth from '@/hooks/useAuth';
import { toast } from 'react-toastify';

// Types adapted from surveys for simple rendering
type QuestionType = 'single_choice' | 'multiple_choice' | 'text_input' | 'textarea';
interface QuestionItem {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
}

interface ReportForm {
  id: string;
  title: string;
  description?: string;
  estimatedTime?: number;
  project?: string;
  questions: QuestionItem[];
}

export const Route = createFileRoute('/dashboard/reporting/make-report')({
  component: MakeReportPage,
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: search.reportId as string,
  }),
});

function MakeReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: surveyResp, isLoading: isLoadingSurvey, isError: isErrorSurvey } = useSurveysList({ surveyType: 'report-form', status: 'active', limit: 1, allowed: true });

  // Map backend survey -> page ReportFor m shape
  const report = useMemo<ReportForm | null>(() => {
    const survey = surveyResp?.result[0];
    if (!survey) return null;
    return {
      id: survey.id,
      title: survey.title,
      description: survey.description ?? undefined,
      estimatedTime: Number(survey.estimatedTime) || undefined,
      project: survey.project ?? undefined,
      questions: (survey.questionItems ?? []).map((q: any) => ({
        id: String(q.id),
        title: q.title,
        description: q.description ?? undefined,
        type: q.type as QuestionType,
        required: !!q.required,
        options: Array.isArray(q.options)
          ? q.options
          : typeof q.options === 'string' && q.options.trim()
            ? (() => { try { return JSON.parse(q.options); } catch { return [String(q.options)]; } })()
            : undefined,
      })),
    };
  }, [surveyResp]);

  // Local answers state
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync: submitAnswers } = useSubmitSurveyAnswers(report?.id ?? '');

  if (isLoadingSurvey) {
    return (
      <div className="text-center py-20">
        <div className="text-gray-500">Loading report form…</div>
      </div>
    );
  }

  if (isErrorSurvey || !report) {
    return (
      <div className="min-h-[320px] flex items-center justify-center">
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
    );
  }

  const setAnswer = (qid: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic required validation
    const missing = report.questions.filter(q => q.required && (answers[q.id] == null || (Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length === 0 : String(answers[q.id]).trim() === '')));
    if (missing.length > 0) {
      toast.info(`Please answer required question(s): ${missing.map(m => m.title).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      // build SubmitAnswersRequest based on answers
      const payload = {
        answers: Object.entries(answers).map(([questionId, val]) => ({
          questionId,
          answerText: Array.isArray(val) ? (val as string[]).join(', ') : String(val ?? ''),
          answerOptions: Array.isArray(val) ? (val as string[]) : undefined,
          userId: user?.id ?? undefined,
        })),
      };

      await submitAnswers(payload);
      toast.success('Report submitted successfully');
      navigate({ to: '/dashboard/reporting' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white drop-shadow-sm rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate({ to: '/dashboard/reporting' })}
              className="mr-4 text-gray-600 hover:text-primary cursor-pointer transition-colors p-2 rounded-full hover:bg-gray-100"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          </div>
          <p className="text-gray-600">{report.description}</p>
          {report.estimatedTime && (
            <div className="mt-2 text-sm text-gray-500 italic">Estimated time: {report.estimatedTime} minutes</div>
          )}
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit}>
          <div className="divide-y divide-gray-100">
            {report.questions.map((question, index) => (
              <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-sm font-medium mr-3 mt-1">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {question.title}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    {question.description && (
                      <p className="mt-1 text-sm text-gray-500">{question.description}</p>
                    )}

                    <div className="mt-2">
                      {question.type === 'single_choice' && question.options && (
                        <div className="space-y-1">
                          {question.options.map((option) => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) => setAnswer(question.id, e.target.value)}
                                className="h-4 w-4 text-primary border-gray-300 outline-none focus:ring-primary"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-3">
                          {question.options.map((option) => {
                            const curr = (answers[question.id] as string[]) || [];
                            const checked = curr.includes(option);
                            return (
                              <label key={option} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition-colors">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={checked}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const next = checked ? curr.filter((v) => v !== val) : [...curr, val];
                                    setAnswer(question.id, next);
                                  }}
                                  className="h-4 w-4 text-primary border-gray-300 outline-none rounded focus:ring-primary"
                                />
                                <span className="text-gray-700">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {question.type === 'text_input' && (
                        <input
                          type="text"
                          value={(answers[question.id] as string) || ''}
                          onChange={(e) => setAnswer(question.id, e.target.value)}
                          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary outline-none px-4 py-2.5 border placeholder-gray-400 transition-colors"
                          placeholder="Type your answer"
                        />
                      )}

                      {question.type === 'textarea' && (
                        <textarea
                          value={(answers[question.id] as string) || ''}
                          onChange={(e) => setAnswer(question.id, e.target.value)}
                          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary outline-none px-4 py-2.5 border placeholder-gray-400 transition-colors"
                          rows={4}
                          placeholder="Type your answer"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate({ to: '/dashboard/reporting' })}
              className="px-5 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}