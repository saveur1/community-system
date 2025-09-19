import Breadcrumb from '@/components/ui/breadcrum';
import { createFileRoute, Link, useParams, useRouter } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FaClock, FaListOl, FaUsers, FaAsterisk, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaEdit, FaEye, FaTrash, FaDownload, FaFilePdf, FaFileExcel, FaChartLine } from 'react-icons/fa';
import { useSurvey, useDeleteSurvey } from '@/hooks/useSurveys';
import { spacer, timeAgo } from '@/utility/logicFunctions';
import DeleteSurveyModal from '@/components/features/surveys/delete-survey-modal';
import { CustomDropdown, DropdownItem } from '@/components/ui/dropdown';
import ExportSurveyModal from '@/components/features/surveys/details/export-survey-modal';

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
        return (
          <div className="space-y-3">
            {(question.options || []).map((option: string, idx: number) => (
              <label key={idx} className="flex items-center space-x-3 cursor-not-allowed opacity-70">
                <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {(question.options || []).map((option: string, idx: number) => (
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
      default:
        return <div className="text-gray-400 italic">Question preview not available</div>;
    }
  };

  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'text_input': return 'Text Input';
      case 'textarea': return 'Long Text';
      default: return question.type;
    }
  };

  const getQuestionTypeColor = () => {
    switch (question.type) {
      case 'single_choice': return 'bg-blue-100 text-blue-800';
      case 'multiple_choice': return 'bg-purple-100 text-purple-800';
      case 'text_input': return 'bg-gray-100 text-gray-800';
      case 'textarea': return 'bg-indigo-100 text-indigo-800';
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
            <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-primary rounded-full flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {question.title}
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
        <div className="hidden md:block text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">
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
  const { data, isLoading } = useSurvey(viewId, true);
  const survey = data?.result;
  const router = useRouter();

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel');
  const deleteSurvey = useDeleteSurvey();

  const questions = useMemo(() => survey?.questionItems ?? [], [survey]);
  const answersCount = (survey as any)?.responses?.length ?? 0;
  const surveyResponses = survey?.responses ?? [];

  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'time' | 'respondentName' | 'surveyTitle'>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Delete handlers
  const handleDeleteClick = () => {
    if (survey) {
      setToDelete({ id: survey.id, title: survey.title });
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (toDelete) {
      deleteSurvey.mutate(toDelete.id, {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setToDelete(null);
          router.navigate({ to: '/dashboard/surveys' });
        }
      });
    }
  };

  const handleExportClick = (type: 'excel' | 'pdf') => {
    setExportType(type);
    setExportModalOpen(true);
  };

  const handleExportModalClose = () => {
    setExportModalOpen(false);
  };

  // Use new endpoint to get this survey's responses
  // const { data: surveyResponses, isLoading: isLoadingResponses } = useSurveyResponses(viewId, page, pageSize, true);

  // Adapt rows for table
  const fetchedResponses = useMemo(() => {
    const rows: Array<{
      id: string;
      respondentName: string;
      respondentRole?: string;
      time?: string | null;
      surveyStatus?: string;
    }> = [];
    for (const r of surveyResponses as any[]) {
      console.log(r);
      const respondentName = r.user?.name ?? 'Anonymous';
      const respondentRole = r.user?.roles?.[0]?.name ?? '';
      const time = r.createdAt ?? r.updatedAt ?? null;
      rows.push({
        id: String(r.id),
        respondentName,
        respondentRole,
        time,
        surveyStatus: (survey as any)?.status ?? 'unknown',
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
    return sortDir === 'asc' ? <FaSortUp className='inline ml-1' /> : <FaSortDown className='inline ml-1' />;
  };

  return (
    <div className="pb-10">
      <Breadcrumb
        items={[
          { title: "Dashboard", link: "/dashboard" },
          { title: "Surveys", link: "/dashboard/surveys" },
          { title: survey?.title || "—" }
        ]}
        title="Survey Details"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-20 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 bg-title/5 w-full overflow-hidden pb-0">
            <div className="flex items-start flex-wrap w-full gap-4">
              <div className="flex-1 flex-wrap">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">{survey?.title || (isLoading ? "Loading…" : "Survey")}</h1>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link to={`/dashboard/surveys/edit/$edit-id`} params={{ 'edit-id': survey?.id || "" }} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-dark cursor-pointer py-1.5 px-3 border border-transparent hover:border-primary/30 rounded-md">
                      <FaEdit className="" /><span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button onClick={handleDeleteClick} className="inline-flex items-center gap-2 text-sm text-red-700 hover:text-red-900 cursor-pointer py-1.5 px-3 border border-transparent hover:border-red-200 rounded-md">
                      <FaTrash className="" /><span className="hidden sm:inline">Delete</span>
                    </button>
                    <CustomDropdown
                      trigger={
                        <button className="inline-flex items-center gap-2 text-sm text-title hover:text-title/80 cursor-pointer py-1.5 px-3 border border-gray-200 rounded-md">
                          <FaDownload /> <span>Export</span>
                        </button>
                      }
                      position="bottom-right"
                      dropdownClassName="bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40"
                    >
                      <DropdownItem
                        icon={<FaFileExcel className="text-green-600" />}
                        onClick={() => handleExportClick('excel')}
                      >
                        Export to Excel
                      </DropdownItem>
                      <DropdownItem
                        icon={<FaFilePdf className="text-red-600" />}
                        onClick={() => handleExportClick('pdf')}
                      >
                        Export to PDF
                      </DropdownItem>
                    </CustomDropdown>
                    <Link to={`/dashboard/surveys/$view-id/analytics`} params={{ 'view-id': survey?.id || "" }} className="inline-flex items-center gap-2 text-sm text-success hover:text-success/80 cursor-pointer py-1.5 px-3 border border-gray-200 rounded-md">
                      <FaChartLine /> <span>Analytics</span>
                    </Link>
                  </div>
                </div>
                <div className="mt-2 flex items-center flex-wrap w-full gap-6 text-sm text-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus((survey as any)?.status)}`}>{(survey as any)?.status ?? `—`}</span>
                  <span className="inline-flex items-center gap-2"><FaClock /> Estimated: {survey?.estimatedTime ?? "—"}Min</span>
                  <span className="inline-flex items-center gap-2"><FaListOl /> Questions: {questions.length}</span>
                  <span className="inline-flex items-center gap-2"><FaUsers /> Respondents: {answersCount}</span>
                </div>
              </div>
            </div>
            <div className="mt-10 border-b border-gray-200">
              <nav className="-mb-px flex gap-6" aria-label="Tabs">
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === `questions` ? `border-primary text-primary` : `border-transparent text-gray-500 hover:text-gray-700`}`}
                  onClick={() => setActiveTab('questions')}
                >
                  Questions ({questions.length})
                </button>
                <button
                  className={`pb-2 border-b-4 text-sm font-medium transition-colors ${activeTab === `responses` ? `border-primary text-primary` : `border-transparent text-gray-500 hover:text-gray-700`}`}
                  onClick={() => setActiveTab('responses')}
                >
                  Responses ({sorted.length})
                </button>
              </nav>
            </div>
          </div>
        </div>
        {activeTab === 'questions' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Survey Questions</h2>
              <div className="text-sm text-gray-500">
                {questions.filter((q: any) => q.required).length} required • {questions.filter((q: any) => !q.required).length} optional
              </div>
            </div>
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading questions…</div>
            ) : (
              questions.map((question: any, index: number) => (
                <QuestionPreview key={question.id} question={question} index={index} />
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, id, status..."
                className="w-full sm:flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center justify-between sm:justify-end gap-2">
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
            {/* Mobile cards */}
            <div className="sm:hidden p-4 space-y-3">
              {isLoading ? (
                <div className="text-center text-gray-500 py-8">Loading responses...</div>
              ) : pageData.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No responses found.</div>
              ) : (
                pageData.map((r) => (
                  <div key={r.id} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{r.respondentName}</div>
                        <div className="text-xs text-gray-500 capitalize">{spacer(r.respondentRole ?? 'Unknown')}</div>
                        <div className="mt-1 text-xs text-gray-500">{timeAgo(r.time)}</div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(r.surveyStatus as any)}`}>
                        {r.surveyStatus}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Link to={`/dashboard/surveys/$view-id/$response-id`} params={{ 'view-id': r.id, 'response-id': r.id }} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 bg-gray-50 rounded-md hover:bg-gray-100 text-sm">
                        <FaEye /> Review
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('respondentName')}>Responder {sortIcon('respondentName')}</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Responder Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer" onClick={() => toggleSort('time')}>Time {sortIcon('time')}</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Survey Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">Loading responses...</td></tr>
                  ) : pageData.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-gray-500">No responses found.</td></tr>
                  ) : (
                    pageData.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="font-medium">{r.respondentName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{spacer(r.respondentRole ?? 'Unknown')}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{timeAgo(r.time)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${formatStatus(r.surveyStatus as any)}`}>
                            {r.surveyStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link to={`/dashboard/surveys/$view-id/$response-id`} params={{ 'view-id': r.id, 'response-id': r.id }} className="px-3 py-1.5 border border-gray-300 cursor-pointer bg-gray-50 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2">
                            <FaEye />
                            <span>Review</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSurveyModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        surveyTitle={toDelete?.title || ''}
      />

      <ExportSurveyModal
        isOpen={exportModalOpen}
        onClose={handleExportModalClose}
        exportType={exportType}
        surveyTitle={survey?.title || ''}
        survey={survey}
      />
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/$view-id/')({
  component: SurveyDetail,
})