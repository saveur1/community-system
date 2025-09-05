import React, { useMemo, useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { useSurvey } from '@/hooks/useSurveys';
// removed top-level import of ReactApexChart to avoid SSR error
import { FaDownload, FaShareAlt, FaChartLine } from 'react-icons/fa';

/*
  Survey Analytics Page (design-only)
  - Uses useSurvey to show survey title
  - Contains placeholders and sample charts using react-apexcharts
  - Replace sampleSeries / sampleOptions with real data when available
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
  const navigate = useNavigate();

  // fetch survey metadata (title, questions) - integration point
  const { data: surveyResp, isLoading, isError } = useSurvey(surveyId, true);
  const survey = surveyResp?.result;

  // Placeholder sample metrics (replace with real data)
  const [metrics, setMetrics] = useState({
    totalResponses: 1245,
    completionRate: 0.75,
    avgTimeMins: 6.4,
    dropOff: [
      { step: 'Q1', rate: 0.02 },
      { step: 'Q2', rate: 0.06 },
      { step: 'Q3', rate: 0.17 },
    ],
  });

  useEffect(() => {
    // TODO: load analytics for surveyId (API) and setMetrics(...)
    // kept as placeholders for design
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

  // Word cloud placeholder (simple list)
  const sampleWords = useMemo(() => [
    { word: 'access', count: 42 },
    { word: 'support', count: 36 },
    { word: 'cost', count: 28 },
    { word: 'quality', count: 21 },
    { word: 'delay', count: 18 },
  ], []);

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
        // ignore; charts will render placeholders
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
            <h1 className="text-2xl font-bold text-gray-900">Survey analytics</h1>
            <p className="text-sm text-gray-600 mt-1">Overview and detailed insights for this survey. (Design-only page)</p>
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
          <KPICard title="Total responses" value={String(metrics.totalResponses)} hint="Submitted responses" />
          <KPICard title="Completion rate" value={formatPct(metrics.completionRate)} hint="Share of starters who finished" />
          <KPICard title="Average time" value={`${metrics.avgTimeMins.toFixed(1)} min`} hint="Average completion time" />
          <KPICard title="Drop-off (largest step)" value={`${Math.max(...metrics.dropOff.map(d => d.rate)) * 100}%`} hint="Where most participants left" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends & response overview */}
          <div className="col-span-2 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Response trends</h3>
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
                <div className="text-xs text-gray-500">Completion over time</div>
                <div className="text-lg font-semibold">75%</div>
              </div>
              <div className="p-3 border border-gray-300 rounded">
                <div className="text-xs text-gray-500">Avg time (mins)</div>
                <div className="text-lg font-semibold">{metrics.avgTimeMins.toFixed(1)}</div>
              </div>
              <div className="p-3 border border-gray-300 rounded">
                <div className="text-xs text-gray-500">Peak hour</div>
                <div className="text-lg font-semibold">14:00 - 15:00</div>
              </div>
            </div>
          </div>

          {/* Demographics / Devices */}
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Engagement & Demographics</h3>
              <div className="text-sm text-gray-500">Devices & sources</div>
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
              <div className="mb-2"><strong>Top sources:</strong> Link (56%), Email (30%), App (14%)</div>
              <div><strong>Peak day:</strong> Wednesday</div>
            </div>
          </div>
        </div>

        {/* Per-question analytics */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Per-question analytics</h3>

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
                    ) : q.type === 'text_input' || q.type === 'textarea' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-300 rounded p-4">
                          <div className="text-sm text-gray-600 mb-2">Word cloud (placeholder)</div>
                          <div className="flex flex-wrap gap-2">
                            {sampleWords.map(w => (
                              <span key={w.word} className="text-xs bg-gray-100 px-2 py-1 rounded">{w.word} ({w.count})</span>
                            ))}
                          </div>
                        </div>
                        <div className="border border-gray-300 rounded p-4">
                          <div className="text-sm text-gray-600 mb-2">Sentiment (placeholder)</div>
                          <div className="text-lg font-semibold">Positive: 62% • Neutral: 24% • Negative: 14%</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Question type not visualized yet.</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quality & Insights column */}
          <div className="bg-white border border-gray-300 rounded-lg h-fit p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Quality & Insights</h3>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Skipped questions</div>
              <div className="text-lg font-semibold mt-2">12% skipped at least one question</div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Drop-off highlights</div>
              <ul className="text-sm mt-2 space-y-1">
                {metrics.dropOff.map(d => <li key={d.step} className="text-gray-700">{d.step}: {(d.rate * 100).toFixed(1)}% drop-off</li>)}
              </ul>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-500">Auto-generated summary</div>
              <div className="mt-2 text-sm text-gray-700">
                Most respondents completed the survey and rated the new feature positively. Common concerns: cost and accessibility in rural locations.
                {/* TODO: replace with server-side or client-side summary generator */}
              </div>
            </div>

            <div className="mt-4">
              <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md">
                <FaChartLine /> Download full analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/dashboard/surveys/analytics/$survey-id')({
  component: AnalyticsPage,
});

export default AnalyticsPage;
