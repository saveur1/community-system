import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { FaList, FaTh } from 'react-icons/fa';
import { SurveyToolbar } from '@/components/features/surveys/survey-toolbar';
import { SurveyPagination } from '@/components/features/surveys/survey-pagination';
import { useSurveysList } from '@/hooks/useSurveys';

const ReportingList = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Use API to fetch report-forms the user can access
  const { data: reportsResp, isLoading: isLoadingReports, isError: isErrorReports } = useSurveysList({
    surveyType: 'report-form',
    status: 'active',
    page,
    limit: pageSize,
    responded: true,
    allowed: true,
  });

  const getStatusColor = (status: 'active' | 'paused' | 'archived') => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-200 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Map backend Survey -> UI report shape
  const reports = (reportsResp?.result ?? []).map((s: any) => ({
    id: s.id,
    title: s.title,
    description: s.description ?? '',
    status: s.status ?? 'active',
    estimatedTime: Number(s.estimatedTime) || 0,
    project: s.project || '',
    questionCount: (s.questionItems ?? []).length,
  }));

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginated.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>{r.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.questionCount}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.estimatedTime}Min</td>
                <td className="px-6 py-4 text-sm text-gray-700">{r.project}</td>
                <td className="px-6 py-4">
                  <Link
                    to="/dashboard/reporting/review-report"
                    search={{ reportId: r.id }}
                    className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={7}>
                  {isLoadingReports ? 'Loading report forms...' : isErrorReports ? 'Failed to load report forms.' : 'No report submissions available.'}
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
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(r.status)}`}>{r.status}</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">{r.description}</p>
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>{r.questionCount} questions</span>
            <span>{r.estimatedTime}Min</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-500">{r.project}</span>
            <Link
              to="/dashboard/reporting/make-report"
              search={{ reportId: r.id }}
              className="inline-flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary/90"
            >
              Make report
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-10">
      <Breadcrumb items={["Dashboard", "Reporting"]} title="Reporting" className='absolute top-0 left-0 w-full px-6' />

      <div className="pt-14">
        <SurveyToolbar
          viewMode={viewMode}
          setViewMode={setViewMode}
          search={search}
          setSearch={setSearch}
          filteredCount={filteredCount}
          title="Reports"
          createButtonLink="/dashboard/reporting/make-report"
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
