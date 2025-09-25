import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaPlus } from 'react-icons/fa';
import MainToolbar from '@/components/common/main-toolbar';
import { SurveyPagination } from '@/components/features/surveys/survey-pagination';
import { useSurveyResponses } from '@/hooks/useSurveys';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';

const ReportingList = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { user } = useAuth();
  
  const { data: reportsResp, isLoading: isLoadingReports, isError: isErrorReports } = useSurveyResponses(
    undefined,
    user?.id,
    page,
    pageSize,
    "report-form",
    !!user?.id,
    search
  );

  const reports = (reportsResp?.result ?? [])
    .filter((response: any) => response.survey?.surveyType === 'report-form')
    .map((response: any) => ({
      id: response.id,
      title: `Visit ${response.userReportCounter}`,
      surveyTitle: response.survey?.title || 'Unknown Survey',
      questionCount: (response.survey?.questionItems ?? []).length,
      respondedAt: response.createdAt,
      project: response.survey?.project?.name || 'No Project',
      surveyId: response.survey?.id,
    }));

  const excelDataExported = useMemo(() => {
    return reports.map((r, idx) => ({
      id: idx + 1,
      reportTitle: r.title,
      surveyTitle: r.surveyTitle,
      questionCount: r.questionCount,
      respondedAt: r.respondedAt ? format(parseISO(r.respondedAt), 'MMM dd, yyyy h:mm a') : '',
      project: r.project,
    }));
  }, [reports]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  const totalItems = reportsResp?.total ?? (reportsResp ? reports.length : 0);
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const filteredCount = reportsResp?.total ?? reports.length;

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Report</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Questions</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Responded At</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Project</th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-3 lg:px-6 py-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{r.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{r.surveyTitle}</div>
                  <div className="lg:hidden mt-2 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.questionCount} questions</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(r.respondedAt)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{r.project}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{r.questionCount}</td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{formatDate(r.respondedAt)}</td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{r.project}</td>
                <td className="px-3 lg:px-6 py-4">
                  <Link
                    to="/dashboard/reporting/$report-id"
                    params={{ 'report-id': r.id }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-200 px-3 py-1 rounded-md hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white text-sm"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td className="px-3 lg:px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400" colSpan={5}>
                  {isLoadingReports ? 'Loading your responses...' : isErrorReports ? 'Failed to load your responses.' : 'No report submissions available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reports.map((r) => (
        <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2 justify-between">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">{r.title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{r.surveyTitle}</p>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span>{r.questionCount} questions</span>
            <span>{formatDate(r.respondedAt)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">{r.project}</span>
            <Link
              to="/dashboard/reporting/$report-id"
              params={{ 'report-id': r.id }}
              className="inline-flex items-center gap-2 bg-primary dark:bg-primary/80 text-white px-3 py-1.5 rounded-md hover:bg-primary/90 dark:hover:bg-primary"
            >
              Review
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      <Breadcrumb
        items={[
          { title: "Dashboard", link: "/dashboard" },
          "Data Collection",
        ]}
        title="Data collection"
        className="absolute top-0 left-0 w-full px-6 bg-white dark:bg-gray-900"
      />

      <div className="pt-12 lg:pt-14">
        <MainToolbar
          title="Data collection"
          filteredCount={filteredCount}
          search={search}
          setSearch={setSearch}
          viewMode={viewMode}
          setViewMode={setViewMode}
          showCreate={true}
          createButton={{
            to: "/dashboard/reporting/make-report",
            label: "Collect Data",
            icon: <FaPlus className="text-gray-700 dark:text-gray-200" />
          }}
          excelData={excelDataExported}
          excelColumnWidths={{
            id: 6,
            reportTitle: 20,
            surveyTitle: 30,
            questionCount: 15,
            respondedAt: 25,
            project: 20,
          }}
          excelFileName="report-responses"
        />
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}

      <SurveyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginatedCount={reports.length}
        filteredCount={filteredCount}
        pageSize={pageSize}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </div>
  );
};

export const Route = createFileRoute('/dashboard/reporting/')({
  component: ReportingList,
});