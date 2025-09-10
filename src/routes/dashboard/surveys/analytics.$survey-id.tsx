import React, { useMemo, useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { useSurvey } from '@/hooks/useSurveys';
import { FaDownload, FaShareAlt } from 'react-icons/fa';

/*
  Survey Analytics Page (design-only, AI features removed)
  - Uses useSurvey to show survey title
  - Contains placeholders and sample charts using react-apexcharts
  - Replace sampleSeries / sampleOptions with real data when available
  - Removed AI-dependent features (sentiment, word cloud, auto-summary)
  - Removed Quality & Insights column
  - Added non-AI metrics: unique respondents, response count table, response time breakdown
*/

const KPICard: React.FC<{ title: string; value: string; hint?: string }> = ({ title, value, hint }) => (
  <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
    <div className="text-gray-700">{title}</div>
    <div className="mt-2 text-2xl font-semibold text-gray-800">{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

function formatPct(n: number) {
  return `${Math.round(n * 100)}%`;
}

const AnalyticsPage: React.FC = () => {
  const params = Route.useParams();
  const surveyId = String(params['survey-id'] ?? '');

  // Fetch survey metadata (title, questions) - integration point
  const { data: surveyResp, isLoading, isError } = useSurvey(surveyId, true);
  const survey = surveyResp?.result;

  // Placeholder sample metrics (replace with real data)
  const [metrics, setMetrics] = useState({
    totalResponses: 1245,
    uniqueRespondents: 1100, // Added unique respondents
    completionRate: 0.75,
    avgTimeMins: 6.4,
    minTimeMins: 2.5, // Added for response time breakdown
    maxTimeMins: 15.0, // Added for response time breakdown
    medianTimeMins: 6.0, // Added for response time breakdown
    dropOff: [
      { step: 'Q1', rate: 0.02 },
      { step: 'Q2', rate: 0.06 },
      { step: 'Q3', rate: 0.17 },
    ],
  });

  useEffect(() => {
    // TODO: Load analytics for surveyId (API) and setMetrics(...)
    // Kept as placeholders for design
  }, [surveyId]);

  // Sample series/options for line / bar charts
  const trendsSeries = useMemo(() => [
    { name: 'Responses', data: [10, 45, 120, 300, 420, 580, 1245] },
  ], []);

  const trendsOptions = useMemo(() => ({
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
    stroke: { curve: 'smooth' as const },
    colors: ['#0ea5a4'],
    tooltip: { theme: 'light' as const },
  }), []);

  const deviceSeries = useMemo(() => [
    { name: 'Desktop', data: [60] },
    { name: 'Mobile', data: [35] },
    { name: 'Tablet', data: [5] },
  ], []);

  const deviceOptions = useMemo(() => ({
    chart: { type: 'donut' as const },
    labels: ['Desktop', 'Mobile', 'Tablet'],
    legend: { position: 'bottom' as const },
    colors: ['#2563eb', '#14b8a6', '#f59e0b'],
  }), []);

  const sampleQuestionBarSeries = useMemo(() => ([{ name: 'Responses', data: [120, 300, 80, 200] }]), []);
  const sampleQuestionBarOptions = useMemo(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: ['Option A', 'Option B', 'Option C', 'Option D'] },
    colors: ['#1c89ba'],
  }), []);

  // Dynamically import react-apexcharts on client only
  const [ChartComponent, setChartComponent] = useState<any | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mounted = true;
    import('react-apexcharts')
      .then(mod => {
        if (mounted) setChartComponent(() => mod.default);
      })
      .catch(() => {
        // Ignore; charts will render placeholders
      });
    return () => { mounted = false; };
  }, []);

  if (!surveyId) {
    return <div className="p-6 text-red-600">Invalid survey - no id provided</div>;
  }

  return (
    <div className="pb-10">
      <Breadcrumb
        items={['Community', 'Surveys', 'Analytics']}
        title={`Analytics${survey?.title ? ` — ${survey.title}` : ''}`}
        className="absolute top-0 left-0 w-full px-6"
      />

      <div className="max-w-8xl mx-auto pt-20">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Overview and detailed metrics for this survey.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm" onClick={() => { /* TODO: export summary */ }}>
              <FaDownload /> Export
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm" onClick={() => { /* TODO: share */ }}>
              <FaShareAlt /> Share
            </button>
          </div>
        </div>

        {/* Response Overview KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard title="Total Responses" value={String(metrics.totalResponses)} hint="Submitted responses" />
          <KPICard title="Unique Respondents" value={String(metrics.uniqueRespondents)} hint="Distinct users" />
          <KPICard title="Completion Rate" value={formatPct(metrics.completionRate)} hint="Share of starters who finished" />
          <KPICard title="Average Time" value={`${metrics.avgTimeMins.toFixed(1)} min`} hint="Average completion time" />
        </div>

        {/* Response Time Breakdown */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Response Time Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 border border-gray-300 rounded">
              <div className="text-xs text-gray-500">Minimum Time</div>
              <div className="text-lg font-semibold">{metrics.minTimeMins.toFixed(1)} min</div>
            </div>
            <div className="p-3 border border-gray-300 rounded">
              <div className="text-xs text-gray-500">Median Time</div>
              <div className="text-lg font-semibold">{metrics.medianTimeMins.toFixed(1)} min</div>
            </div>
            <div className="p-3 border border-gray-300 rounded">
              <div className="text-xs text-gray-500">Maximum Time</div>
              <div className="text-lg font-semibold">{metrics.maxTimeMins.toFixed(1)} min</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends & Response Overview */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Response Trends</h3>
              <div className="text-sm text-gray-500">Daily / Weekly submissions</div>
            </div>
            <div>
              {ChartComponent ? (
                // @ts-ignore - ChartComponent is dynamically imported
                <ChartComponent options={trendsOptions} series={trendsSeries as any} type="area" height={280} />
              ) : (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded">Loading chart...</div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border border-gray-300 rounded">
                <div className="text-xs text-gray-500">Completion Over Time</div>
                <div className="text-lg font-semibold">75%</div>
              </div>
              <div className="p-3 border border-gray-300 rounded">
                <div className="text-xs text-gray-500">Avg Time (mins)</div>
                <div className="text-lg font-semibold">{metrics.avgTimeMins.toFixed(1)}</div>
              </div>
              <div className="p-3 border border-gray-300 rounded">
                <div className="text-xs text-gray-500">Peak Hour</div>
                <div className="text-lg font-semibold">14:00 - 15:00</div>
              </div>
            </div>
          </div>

          {/* Demographics / Devices */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Engagement & Demographics</h3>
              <div className="text-sm text-gray-500">Devices & Sources</div>
            </div>

            <div className="mb-4">
              {ChartComponent ? (
                // @ts-ignore
                <ChartComponent options={deviceOptions} series={[44, 33, 23]} type="donut" height={220} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded">Loading chart...</div>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <div className="mb-2"><strong>Top Sources:</strong> Link (56%), Email (30%), App (14%)</div>
              <div><strong>Peak Day:</strong> Wednesday</div>
            </div>
          </div>
        </div>

        {/* Per-Question Analytics */}
        <div className="mt-6 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Per-Question Analytics</h3>

          {/* Response Count Table */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Response Counts per Question</h4>
            <table className="w-full text-sm text-gray-600">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Question</th>
                  <th className="text-right py-2">Responses</th>
                  <th className="text-right py-2">Skip Rate</th>
                </tr>
              </thead>
              <tbody>
                {(survey?.questionItems || []).map((q: any, idx: number) => (
                  <tr key={q.id} className="border-b border-gray-200">
                    <td className="py-2">{idx + 1}. {q.title}</td>
                    <td className="text-right py-2">1,234</td>
                    <td className="text-right py-2">{formatPct(0.12)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* For each question - design placeholder */}
          {(survey?.questionItems ?? []).length === 0 ? (
            <div className="text-sm text-gray-500">No question items available (design placeholder).</div>
          ) : (
            (survey!.questionItems || []).map((q: any, idx: number) => (
              <div key={q.id} className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{idx + 1}. {q.title}</div>
                    <div className="text-xs text-gray-500">{q.type}</div>
                  </div>
                  <div className="text-xs text-gray-400">Respondents: 1,234</div>
                </div>

                <div className="mt-3">
                  {q.type === 'single_choice' || q.type === 'multiple_choice' ? (
                    ChartComponent ? (
                      // @ts-ignore
                      <ChartComponent options={sampleQuestionBarOptions} series={sampleQuestionBarSeries as any} type="bar" height={200} />
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded">Loading chart...</div>
                    )
                  ) : (
                    <div className="text-sm text-gray-500">Text responses not visualized (raw data available on export).</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/analytics/$survey-id')({
  component: AnalyticsPage,
});

export default AnalyticsPage;