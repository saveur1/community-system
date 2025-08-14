import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, useParams, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FaClock, FaListOl, FaUsers, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaEye, FaAsterisk } from 'react-icons/fa';

type Question = { 
  id: number; 
  text: string; 
  type: 'single-choice' | 'multiple-choice' | 'paragraph' | 'short-text' | 'rating' | 'yes-no' | 'long-text';
  required: boolean;
  options?: string[];
  description?: string;
};

type ResponseRow = { id: number; respondent: string; date: string; score?: number; status: 'Completed' | 'Partial' };

function formatStatus(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Draft':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-red-100 text-red-800';
    case 'Pending':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

const QuestionPreview = ({ question, index }: { question: Question; index: number }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-not-allowed opacity-70">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <label key={idx} className="flex items-center space-x-3 cursor-not-allowed opacity-70">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} disabled className="text-2xl text-gray-300 cursor-not-allowed">
                ★
              </button>
            ))}
            <span className="text-sm text-gray-500 ml-3">1 = Poor, 5 = Excellent</span>
          </div>
        );
      
      case 'yes-no':
        return (
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-not-allowed opacity-70">
              <input
                type="radio"
                name={`question-${question.id}`}
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center space-x-2 cursor-not-allowed opacity-70">
              <input
                type="radio"
                name={`question-${question.id}`}
                disabled
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        );
      
      case 'short-text':
        return (
          <input
            type="text"
            disabled
            placeholder="Enter your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        );
      
      case 'long-text':
      case 'paragraph':
        return (
          <textarea
            disabled
            rows={4}
            placeholder="Enter your detailed response..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed resize-none"
          />
        );
      
      default:
        return <div className="text-gray-400 italic">Question preview not available</div>;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'single-choice': return 'Single Choice';
      case 'multiple-choice': return 'Multiple Choice';
      case 'rating': return 'Rating Scale';
      case 'yes-no': return 'Yes/No';
      case 'short-text': return 'Short Text';
      case 'long-text': return 'Long Text';
      case 'paragraph': return 'Paragraph';
      default: return question.type;
    }
  };

  const getQuestionTypeColor = () => {
    switch (question.type) {
      case 'single-choice': return 'bg-blue-100 text-blue-800';
      case 'multiple-choice': return 'bg-purple-100 text-purple-800';
      case 'rating': return 'bg-yellow-100 text-yellow-800';
      case 'yes-no': return 'bg-green-100 text-green-800';
      case 'short-text': return 'bg-gray-100 text-gray-800';
      case 'long-text': 
      case 'paragraph': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {question.text}
                {question.required && (
                  <FaAsterisk className="inline-block ml-2 text-red-500 text-xs" />
                )}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
              )}
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor()}`}>
                  {getQuestionTypeLabel()}
                </span>
                {question.required && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
          ID: {question.id}
        </div>
      </div>
      
      <div className="ml-11">
        <div className="border-l-2 border-gray-100 pl-4">
          {renderQuestionInput()}
        </div>
      </div>
    </motion.div>
  );
};

const SurveyDetail = () => {
  const { 'view-id': viewId } = useParams({ strict: false }) as { 'view-id': string };

  // Mock survey data for demo; hook these to your store/api later
  const survey = useMemo(() => ({
    id: Number(viewId) || 0,
    title: 'Customer Satisfaction Survey',
    status: 'Active',
    estimatedTime: '5 min',
    totalQuestions: 8,
  }), [viewId]);

  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');

  const questions: Question[] = useMemo(() => ([
    { 
      id: 1, 
      text: 'How satisfied are you with our overall service?', 
      type: 'single-choice', 
      required: true,
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
      description: 'Please rate your overall satisfaction with our service.'
    },
    { 
      id: 2, 
      text: 'Which aspects of our service do you find most valuable?', 
      type: 'multiple-choice', 
      required: false,
      options: ['Customer Support', 'Product Quality', 'Pricing', 'Delivery Speed', 'User Interface', 'Documentation']
    },
    { 
      id: 3, 
      text: 'Please tell us what you liked most about your experience', 
      type: 'paragraph', 
      required: false,
      description: 'Share your thoughts in detail about what stood out positively.'
    },
    { 
      id: 4, 
      text: 'Rate our delivery speed', 
      type: 'rating', 
      required: true,
      description: 'How would you rate the speed of our delivery service?'
    },
    { 
      id: 5, 
      text: 'Would you recommend our service to friends or colleagues?', 
      type: 'yes-no', 
      required: true 
    },
    {
      id: 6,
      text: 'What is your primary use case for our product?',
      type: 'short-text',
      required: true,
      description: 'Brief description of how you primarily use our product.'
    },
    {
      id: 7,
      text: 'What improvements would you suggest for our service?',
      type: 'long-text',
      required: false,
      description: 'Please provide detailed feedback on areas where we can improve.'
    },
    {
      id: 8,
      text: 'How did you hear about our service?',
      type: 'single-choice',
      required: false,
      options: ['Social Media', 'Search Engine', 'Word of Mouth', 'Advertisement', 'Blog/Article', 'Other']
    }
  ]), []);

  const [responses] = useState<ResponseRow[]>([
    { id: 1001, respondent: 'John Doe', date: '2025-08-10', score: 85, status: 'Completed' },
    { id: 1002, respondent: 'Jane Smith', date: '2025-08-11', score: 72, status: 'Partial' },
    { id: 1003, respondent: 'Alex Lee', date: '2025-08-12', score: 90, status: 'Completed' },
    { id: 1004, respondent: 'Sam Parker', date: '2025-08-13', score: 66, status: 'Partial' },
    { id: 1005, respondent: 'Chris Fox', date: '2025-08-13', score: 78, status: 'Completed' },
  ]);

  // Table controls (search/sort/pagination)
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof ResponseRow>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return responses.filter(r =>
      r.respondent.toLowerCase().includes(term) ||
      String(r.id).includes(term) ||
      r.status.toLowerCase().includes(term)
    );
  }, [responses, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return sortDir === 'asc' ? -1 : 1;
      if (vb == null) return sortDir === 'asc' ? 1 : -1;
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = (key: keyof ResponseRow) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key: keyof ResponseRow) => {
    if (sortKey !== key) return <FaSort className="inline ml-1" />;
    return sortDir === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  return (
    <div className="pb-10">
      <Breadcrumb
        items={["Community", "Surveys", survey.title]}
        title="Survey Details"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-14 space-y-6">
        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6 bg-title/5 w-full overflow-hidden pb-0">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-800">{survey.title}</h1>
                <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(survey.status)}`}>{survey.status}</span>
                  <span className="inline-flex items-center gap-2"><FaClock /> Estimated: {survey.estimatedTime}</span>
                  <span className="inline-flex items-center gap-2"><FaListOl /> Questions: {survey.totalQuestions}</span>
                  <span className="inline-flex items-center gap-2"><FaUsers /> Respondents: {responses.length}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-10 border-b border-gray-200">
              <nav className="-mb-px flex gap-6" aria-label="Tabs">
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('questions')}
                >
                  Questions ({questions.length})
                </button>
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === 'responses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('responses')}
                >
                  Responses ({responses.length})
                </button>
              </nav>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'questions' ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Survey Questions</h2>
              <div className="text-sm text-gray-500">
                {questions.filter(q => q.required).length} required • {questions.filter(q => !q.required).length} optional
              </div>
            </div>
            
            {questions.map((question, index) => (
              <QuestionPreview key={question.id} question={question} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Responses controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center gap-3 border-b border-gray-200">
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search by name, id, status..."
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Rows:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('id')}>ID {sortIcon('id')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('respondent')}>Respondent {sortIcon('respondent')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('date')}>Date {sortIcon('date')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('score')}>Score {sortIcon('score')}</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pageData.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">{r.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.respondent}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.score ?? '-'}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(r.status)}`}>{r.status}</span></td>
                        <td className="px-6 py-4">
                          <Link
                            to="/dashboard/surveys/$view-id"
                            params={{ 'view-id': String(survey.id) }}
                            className="text-title hover:text-shadow-title inline-flex items-center gap-2"
                          >
                            <FaEye className="w-4 h-4" /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-gray-200 text-sm text-gray-600">
                <div>
                  Page {page} of {totalPages} • {sorted.length} total
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    className="px-3 py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/$view-id')({
  component: SurveyDetail,
})