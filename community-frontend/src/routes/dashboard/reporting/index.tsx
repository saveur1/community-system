import { useState, useMemo } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import {  FaPlus } from 'react-icons/fa';
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

  // Get current user for responderId
  const { user } = useAuth();
  
  // Use API to fetch user's responses to report-forms
  const { data: reportsResp, isLoading: isLoadingReports, isError: isErrorReports } = useSurveyResponses(
    undefined, // surveyId - not filtering by specific survey
    user?.id, // responderId - get responses by current user
    page,
    pageSize,
    "report-form",
    !!user?.id // only enabled when we have user ID
  );


  // Map backend ResponseDetailItem -> UI report shape
  const reports = (reportsResp?.result ?? [])
    .filter((response: any) => response.survey?.surveyType === 'report-form') // Only show report-form responses
    .map((response: any, index: number) => ({
      id: response.id,
      title: `Report ${index + 1}`, // Report 1, Report 2, etc.
      surveyTitle: response.survey?.title || 'Unknown Survey',
      questionCount: (response.survey?.questionItems ?? []).length,
      respondedAt: response.createdAt,
      project: response.survey?.project?.title || 'No Project',
      surveyId: response.survey?.id,
    }));

  // Build rows for Excel export
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

  // Format date with date-fns
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return 'Invalid Date';
    }
  };

  // derive pagination from backend meta when available
  const totalItems = reportsResp?.meta?.total ?? (reportsResp ? reports.length : 0);
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = reports; // server already paginates
  const filteredCount = reportsResp?.meta?.total ?? reports.length;

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responded At</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-3 lg:px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.surveyTitle}</div>
                  {/* Show additional info on mobile only */}
                  <div className="lg:hidden mt-2 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">{r.questionCount} questions</span>
                      <span className="text-xs text-gray-500">{formatDate(r.respondedAt)}</span>
                      <span className="text-xs text-gray-500">{r.project}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700">{r.questionCount}</td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700">{formatDate(r.respondedAt)}</td>
                <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-700">{r.project}</td>
                <td className="px-3 lg:px-6 py-4">
                  <Link
                    to="/dashboard/reporting/$report-id"
                    params={{ 'report-id': r.id }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white text-sm"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td className="px-3 lg:px-6 py-4 text-center text-sm text-gray-500" colSpan={5}>
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
      {paginated.map((r) => (
        <div key={r.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-2 justify-between">
            <h3 className="text-lg font-medium text-gray-700">{r.title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">{r.surveyTitle}</p>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{r.questionCount} questions</span>
            <span>{formatDate(r.respondedAt)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">{r.project}</span>
            <Link
              to="/dashboard/reporting/$report-id"
              params={{ 'report-id': r.id }}
              className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90"
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
      <Breadcrumb items={[
        { title: "Dashboard", link: "/dashboard" },
        "Data Collection",
      ]} title="Data collection" className='absolute top-0 left-0 w-full px-6' />

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
            icon: <FaPlus />
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
          excelFileName='report-responses'
        />
      </div>

      {viewMode === 'list' ? renderTableView() : renderGridView()}

      <SurveyPagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginatedCount={paginated.length}
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
