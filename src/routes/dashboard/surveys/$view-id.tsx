import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FaClock, FaListOl, FaUsers, FaAsterisk, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useSurvey, useSurveyResponses } from '@/hooks/useSurveys';
import type { SurveysListParams } from '@/api/surveys';
import { timeAgo } from '@/utility/logicFunctions';

function formatStatus(status: 'active' | 'paused' | 'archived' | undefined) {
  switch (status) {
    case 'active':
      return 'bg-green-300 text-green-900';
    case 'paused':
      return 'bg-yellow-300 text-yellow-900';
    case 'archived':
      return 'bg-gray-300 text-gray-900';
    default:
      return 'bg-gray-300 text-gray-900';
  }
}

const QuestionPreview = ({ question, index }: { question: any; index: number }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'single_choice':
        let singleOptions: string[] = [];
        try {
          if (typeof question.options === 'string') {
            singleOptions = JSON.parse(question.options);
          } else if (Array.isArray(question.options)) {
            singleOptions = question.options;
          }
        } catch (e) {
          console.warn('Failed to parse options for question:', question.id, e);
          singleOptions = [];
        }
        return (
          <div className="space-y-3">
            {singleOptions.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center space-x-3 cursor-not-allowed opacity-70">
                <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'multiple_choice':
        let multipleOptions: string[] = [];
        try {
          if (typeof question.options === 'string') {
            multipleOptions = JSON.parse(question.options);
          } else if (Array.isArray(question.options)) {
            multipleOptions = question.options;
          }
        } catch (e) {
          console.warn('Failed to parse options for question:', question.id, e);
          multipleOptions = [];
        }
        return (
          <div className="space-y-3">
            {multipleOptions.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center space-x-3 cursor-not-allowed opacity-70">
                <input type="checkbox" disabled className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'text_input':
        return (
          <input
            type="text"
            disabled
            placeholder={question.placeholder || 'Enter your answer...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        );
      case 'textarea':
        return (
          <textarea
            disabled
            rows={4}
            placeholder={question.placeholder || 'Enter your detailed response...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed resize-none"
          />
        );
      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <div className="flex flex-col items-center justify-center space-y-2">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-500">
                {question.allowedTypes?.includes('*') 
                  ? 'Upload any file type' 
                  : `Allowed: ${(question.allowedTypes || []).join(', ')}`}
              </p>
              <p className="text-xs text-gray-400">
                Max size: {question.maxSize || 10}MB
              </p>
              <button 
                type="button" 
                disabled
                className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Choose file
              </button>
            </div>
          </div>
        );
      case 'rating':
        const maxRating = question.maxRating || 5;
        const ratingLabel = question.ratingLabel || 'Rating';
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{ratingLabel}</span>
              <span className="text-xs text-gray-500">1 - {maxRating}</span>
            </div>
            <div className="flex space-x-1">
              {Array.from({ length: maxRating }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  disabled
                  className="w-10 h-10 flex items-center justify-center text-gray-400 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span className="sr-only">Rate {i + 1} out of {maxRating}</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        );
      case 'linear_scale':
        const minValue = question.minValue || 1;
        const maxValue = question.maxValue || 5;
        const minLabel = question.minLabel || '';
        const maxLabel = question.maxLabel || '';
        const range = maxValue - minValue + 1;
        
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Scale</span>
              <span className="text-xs text-gray-500">{minValue} - {maxValue}</span>
            </div>
            <div className="flex items-center space-x-2">
              {minLabel && (
                <span className="text-xs text-gray-500 w-24">{minLabel}</span>
              )}
              <div className="flex-1 flex items-center justify-between">
                {Array.from({ length: range }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <input
                      type="radio"
                      name={`scale-${question.id}`}
                      disabled
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="mt-1 text-xs text-gray-500">{minValue + i}</span>
                  </div>
                ))}
              </div>
              {maxLabel && (
                <span className="text-xs text-gray-500 w-24 text-right">{maxLabel}</span>
              )}
            </div>
          </div>
        );
      default:
        return <div className="text-gray-400 italic">Question type not supported in preview</div>;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'text_input': return 'Short Answer';
      case 'textarea': return 'Paragraph';
      case 'file_upload': return 'File Upload';
      case 'rating': return 'Rating';
      case 'linear_scale': return 'Linear Scale';
      default: return question.type;
    }
  };

  const getQuestionTypeColor = () => {
    switch (question.type) {
      case 'single_choice': return 'bg-blue-100 text-blue-800';
      case 'multiple_choice': return 'bg-purple-100 text-purple-800';
      case 'text_input': return 'bg-gray-100 text-gray-800';
      case 'textarea': return 'bg-indigo-100 text-indigo-800';
      case 'file_upload': return 'bg-green-100 text-green-800';
      case 'rating': return 'bg-yellow-100 text-yellow-800';
      case 'linear_scale': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-white border border-gray-200 rounded-lg p-3 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 lg:gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs lg:text-sm font-semibold">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2 break-words">
                {question.title}
                {question.required && (
                  <FaAsterisk className="inline-block ml-2 text-red-500 text-xs" />
                )}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-600 mb-3 break-words">{question.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-4">
                <span className={`inline-flex items-center px-2 lg:px-2.5 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor()}`}>
                  {getQuestionTypeLabel()}
                </span>
                {question.required && (
                  <span className="inline-flex items-center px-2 lg:px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Required
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded self-start lg:self-auto">
          ID: {question.id}
        </div>
      </div>

      <div className="lg:ml-11">
        <div className="lg:border-l-2 lg:border-gray-100 lg:pl-4">
          {renderQuestionInput()}
        </div>
      </div>
    </motion.div>
  );
};

const SurveyDetail = () => {
  const { 'view-id': viewId } = useParams({ strict: false }) as { 'view-id': string };
  const { data, isLoading } = useSurvey(viewId, true);
  const survey = data?.result;
  const questions = useMemo(() => survey?.questionItems ?? [], [survey]);
  const answersCount = (survey as any)?.responses?.length ?? 0;
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'time' | 'respondentName' | 'surveyTitle'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch surveys the current user has responded to and build response rows
  // params: page and pageSize are used for our pagination controls below
  const params = useMemo((): SurveysListParams => {
    return { page, limit: pageSize, responded: true, owner: 'me' };
  }, [page, pageSize]);

  // Use new endpoint to get this survey's responses
  const { data: surveyResponses, isLoading: isLoadingResponses } = useSurveyResponses(viewId, page, pageSize, true);

  // Adapt rows for table
  const fetchedResponses = useMemo(() => {
    const rows: Array<{
      id: string;
      respondentName: string;
      respondentRole?: string;
      time?: string | null;
      surveyTitle: string;
      surveyStatus?: string;
      surveyId: string;
    }> = [];
    const list = surveyResponses?.result ?? [];
    for (const r of list as any[]) {
      const respondentName = r.user?.name ?? 'Anonymous';
      const respondentRole = r.user?.roles?.[0]?.name ?? '';
      const time = r.createdAt ?? r.updatedAt ?? null;
      rows.push({
        id: String(r.id),
        respondentName,
        respondentRole,
        time,
        surveyTitle: r?.survey?.title ?? 'Untitled',
        surveyStatus: (survey as any)?.status ?? 'unknown',
        surveyId: r?.survey?.id ?? '',
      });
    }
    rows.sort((x, y) => {
      const tx = x.time ? new Date(x.time).getTime() : 0;
      const ty = y.time ? new Date(y.time).getTime() : 0;
      return ty - tx;
    });
    return rows;
  }, [surveyResponses, survey]);



  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return fetchedResponses.filter((r) =>
      r.respondentName.toLowerCase().includes(term) ||
      r.surveyTitle.toLowerCase().includes(term) ||
      String(r.id).includes(term) ||
      (r.respondentRole ?? '').toLowerCase().includes(term)
    );
  }, [fetchedResponses, search]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let va: any;
      let vb: any;
      if (sortKey === 'time') {
        va = a.time ? new Date(a.time).getTime() : 0;
        vb = b.time ? new Date(b.time).getTime() : 0;
      } else if (sortKey === 'respondentName') {
        va = a.respondentName.toLowerCase();
        vb = b.respondentName.toLowerCase();
      } else {
        va = a.surveyTitle.toLowerCase();
        vb = b.surveyTitle.toLowerCase();
      }
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

  const toggleSort = (key: 'time' | 'respondentName' | 'surveyTitle') => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIcon = (key: 'time' | 'respondentName' | 'surveyTitle') => {
    if (sortKey !== key) return <FaSort className="inline ml-1" />;
    return sortDir === 'asc' ? <FaSortUp className="inline ml-1" /> : <FaSortDown className="inline ml-1" />;
  };

  return (
    <div className="pb-6 lg:pb-10 px-2 lg:px-0">
      <Breadcrumb
        items={["Community", "Surveys", survey?.title || '—']}
        title="Survey Details"
        className='absolute top-0 left-0 w-full px-4 lg:px-6'
      />

      <div className="pt-16 lg:pt-20 space-y-4 lg:space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-3 lg:p-6 bg-title/5 w-full overflow-hidden pb-0">
            <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:gap-4">
              <div className="flex-1">
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-3">{survey?.title || (isLoading ? 'Loading…' : 'Survey')}</h1>
                <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-6 text-xs lg:text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus((survey as any)?.status)}`}>{(survey as any)?.status ?? '—'}</span>
                  <span className="inline-flex items-center gap-1 lg:gap-2"><FaClock className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Estimated:</span> {survey?.estimatedTime ?? '—'}Min</span>
                  <span className="inline-flex items-center gap-1 lg:gap-2"><FaListOl className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Questions:</span> {questions.length}</span>
                  <span className="inline-flex items-center gap-1 lg:gap-2"><FaUsers className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="hidden sm:inline">Respondents:</span> {answersCount}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-10 border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap gap-4 lg:gap-6" aria-label="Tabs">
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('questions')}
                >
                  Questions ({questions.length})
                </button>
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'responses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('responses')}
                >
                  Responses ({sorted.length})
                </button>
              </nav>
            </div>
          </div>
        </div>
        {activeTab === 'questions' ? (
          <div className="space-y-3 lg:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 lg:mb-6">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800">Survey Questions</h2>
              <div className="text-xs lg:text-sm text-gray-500">
                {questions.filter((q: any) => q.required).length} required • {questions.filter((q: any) => !q.required).length} optional
              </div>
            </div>
            {isLoading ? (
              <div className="text-sm text-gray-500 text-center py-8">Loading questions…</div>
            ) : (
              questions.map((question: any, index: number) => (
                <QuestionPreview key={question.id} question={question} index={index} />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-3 lg:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 border-b border-gray-200">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, id, status..."
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label className="text-xs lg:text-sm text-gray-600 whitespace-nowrap">Rows:</label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-300 rounded-md px-2 py-1 text-xs lg:text-sm"
                >
                  {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('respondentName')}>Responder {sortIcon('respondentName')}</th>
                    <th className="hidden sm:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('time')}>Time {sortIcon('time')}</th>
                    <th className="hidden md:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('surveyTitle')}>Survey Title {sortIcon('surveyTitle')}</th>
                    <th className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-900">Survey Status</th>
                    <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(isLoadingResponses || isLoading) ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">Loading responses...</td></tr>
                  ) : pageData.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500 text-sm">No responses found.</td></tr>
                  ) : pageData.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-700">
                        <div className="font-medium">{r.respondentName}</div>
                        <div className="text-xs text-gray-500 capitalize">{r.respondentRole ? r.respondentRole.replace('_', ' ') : ''}</div>
                        {/* Show additional info on mobile */}
                        <div className="sm:hidden mt-1 space-y-1">
                          <div className="text-xs text-gray-500">{timeAgo(r.time)}</div>
                          <div className="md:hidden text-xs text-gray-500 truncate">{r.surveyTitle}</div>
                          <div className="lg:hidden">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(r.surveyStatus as any)}`}>
                              {r.surveyStatus}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-700">{timeAgo(r.time)}</td>
                      <td className="hidden md:table-cell px-3 lg:px-6 py-3 lg:py-4 text-xs lg:text-sm text-gray-700">
                        <div className="truncate max-w-xs">{r.surveyTitle}</div>
                      </td>
                      <td className="hidden lg:table-cell px-3 lg:px-6 py-3 lg:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(r.surveyStatus as any)}`}>
                          {r.surveyStatus}
                        </span>
                      </td>
                      <td className="px-3 lg:px-6 py-3 lg:py-4">
                        <Link
                          to="/dashboard/surveys/review-survey"
                          search={{ surveyId: r.surveyId }}
                          className="inline-flex items-center gap-1 lg:gap-2 bg-primary/10 text-primary px-2 lg:px-3 py-1 rounded-md hover:bg-primary hover:text-white text-xs lg:text-sm transition-colors"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 lg:p-4 border-t border-gray-200 text-xs lg:text-sm text-gray-600 gap-3">
              <div className="order-2 sm:order-1">
                Page {page} of {totalPages} • {sorted.length} total
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  className="px-2 lg:px-3 py-1 lg:py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <FaChevronLeft className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
                <span className="px-2 text-xs lg:text-sm">{page} / {totalPages}</span>
                <button
                  className="px-2 lg:px-3 py-1 lg:py-1.5 border rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <FaChevronRight className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/$view-id')({
  component: SurveyDetail,
});