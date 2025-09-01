import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

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

// Mock: resolve a report form with questions by id
const getMockReport = (id: string): ReportForm | null => {
  const catalog: Record<string, ReportForm> = {
    r1: {
      id: 'r1',
      title: 'Weekly Activity Report',
      description: 'Report your weekly activities and outcomes.',
      estimatedTime: 10,
      project: 'Community Health',
      questions: [
        { id: 'q1', title: 'Which region did you work in?', type: 'single_choice', required: true, options: ['North', 'East', 'South', 'West'] },
        { id: 'q2', title: 'Activities performed', type: 'multiple_choice', options: ['Outreach', 'Training', 'Follow-ups', 'Data entry'] },
        { id: 'q3', title: 'Total people reached', type: 'text_input', required: true },
        { id: 'q4', title: 'Describe challenges faced', type: 'textarea' },
      ],
    },
    r2: {
      id: 'r2',
      title: 'Outreach Log',
      description: 'Capture your daily outreach interactions.',
      estimatedTime: 6,
      project: 'Maternal Care',
      questions: [
        { id: 'q1', title: 'Date of outreach', type: 'text_input', required: true },
        { id: 'q2', title: 'Locations visited', type: 'textarea' },
        { id: 'q3', title: 'Services provided', type: 'multiple_choice', options: ['Counseling', 'Screening', 'Referral', 'Education'] },
      ],
    },
    r3: {
      id: 'r3',
      title: 'Training Attendance',
      description: 'Submit attendance for your recent training.',
      estimatedTime: 4,
      project: 'Capacity Building',
      questions: [
        { id: 'q1', title: 'Training name', type: 'text_input', required: true },
        { id: 'q2', title: 'Did you attend?', type: 'single_choice', required: true, options: ['Yes', 'No'] },
        { id: 'q3', title: 'Additional notes', type: 'textarea' },
      ],
    },
  };
  return catalog[id] ?? null;
};

export const Route = createFileRoute('/dashboard/reporting/make-report')({
  component: MakeReportPage,
  validateSearch: (search: Record<string, unknown>) => ({
    reportId: (search.reportId as string) ?? 'r1',
  }),
});

function MakeReportPage() {
  const { reportId } = Route.useSearch();
  const navigate = useNavigate();

  const report = useMemo(() => getMockReport(reportId), [reportId]);

  // Local answers state
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!report) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Report form not found</h2>
        <p className="text-gray-600 mb-4">The selected report form could not be loaded.</p>
        <button
          onClick={() => navigate({ to: '/dashboard/reporting' })}
          className="px-4 py-2 bg-primary/30 text-white rounded-md hover:bg-primary-dark/30 transition-colors"
        >
          Back to Reporting
        </button>
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
      alert(`Please answer required question(s): ${missing.map(m => m.title).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      // TODO: integrate with backend when available
      await new Promise((res) => setTimeout(res, 600));
      alert('Report submitted successfully');
      navigate({ to: '/dashboard/reporting' });
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          </div>
          <p className="text-gray-600">{report.description}</p>
          {report.estimatedTime && (
            <div className="mt-2 text-sm text-gray-500 italic">Estimated time: {report.estimatedTime} minutes</div>
          )}
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit}>
          <div className="divide-y divide-gray-200">
            {report.questions.map((question, index) => (
              <div key={question.id} className="p-6">
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

                    <div className="mt-4">
                      {question.type === 'single_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) => setAnswer(question.id, e.target.value)}
                                className="h-4 w-4 text-primary border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option) => {
                            const curr = (answers[question.id] as string[]) || [];
                            const checked = curr.includes(option);
                            return (
                              <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={checked}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const next = checked ? curr.filter((v) => v !== val) : [...curr, val];
                                    setAnswer(question.id, next);
                                  }}
                                  className="h-4 w-4 text-primary border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{option}</span>
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="Type your answer"
                        />
                      )}

                      {question.type === 'textarea' && (
                        <textarea
                          value={(answers[question.id] as string) || ''}
                          onChange={(e) => setAnswer(question.id, e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: '/dashboard/reporting' })}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
