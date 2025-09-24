import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { createFileRoute } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import { useSurvey } from '@/hooks/useSurveys';
import { useSurveyAnalytics } from '@/hooks/useSurveys';
import { FaChartBar, FaUsers, FaCheckCircle, FaPrint } from 'react-icons/fa';
import { toast } from 'react-toastify';

const KPICard: React.FC<{ 
  title: string; 
  value: string | number; 
  hint?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
}> = ({ title, value, hint, icon, isLoading }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">{title}</div>
      {icon && <div className="text-primary flex-shrink-0">{icon}</div>}
    </div>
    <div className="mt-2 text-xl sm:text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {isLoading ? (
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-6 sm:h-8 w-12 sm:w-16 rounded"></div>
      ) : (
        typeof value === 'number' ? value.toLocaleString() : value
      )}
    </div>
    {hint && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</div>}
  </div>
);

function formatPct(n: number) {
  return `${Math.round(n * 100)}%`;
}

const AnalyticsPage: React.FC = () => {
  const { 'view-id': surveyId } = Route.useParams();
  const { data: survey } = useSurvey(surveyId);
  const { data: analytics, isLoading } = useSurveyAnalytics(surveyId);
  const printRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const trendsSeries = useMemo(() => {
    if (!analytics?.result?.trends) return [];
    const cumulativeData = analytics.result.trends.reduce((acc: number[], trend: any, index: number) => {
      const prevTotal = index > 0 ? acc[index - 1] : 0;
      acc.push(prevTotal + trend.count);
      return acc;
    }, []);
    return [{ name: 'Cumulative Responses', data: cumulativeData }];
  }, [analytics?.result?.trends]);

  const trendsOptions = useMemo(() => ({
    chart: { toolbar: { show: false }, zoom: { enabled: false } },
    xaxis: { 
      categories: analytics?.result?.trends?.map((trend: any) => 
        new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ) || []
    },
    stroke: { curve: 'smooth' as const },
    colors: ['#0ea5a4'],
    tooltip: { theme: 'light' as const },
  }), [analytics?.result?.trends]);

  const getQuestionChartData = (questionAnalytics: any) => {
    if (!questionAnalytics.answerDistribution) return { series: [], options: {} };
    
    if (questionAnalytics.type === 'single_choice' || questionAnalytics.type === 'multiple_choice') {
      const distribution = questionAnalytics.answerDistribution;
      
      // Get all possible options from the question definition
      let allOptions: string[] = [];
      if (questionAnalytics.options) {
        try {
          // Parse options if it's a JSON string
          allOptions = typeof questionAnalytics.options === 'string' 
            ? JSON.parse(questionAnalytics.options) 
            : questionAnalytics.options;
        } catch (e) {
          // If parsing fails, fall back to distribution keys
          allOptions = Object.keys(distribution);
        }
      } else {
        // Fallback to distribution keys if no options defined
        allOptions = Object.keys(distribution);
      }
      
      // Create data array with all options, filling missing ones with 0
      const categories = allOptions;
      const data = categories.map(option => distribution[option] || 0);
      
      return {
        series: [{ name: 'Responses', data }],
        options: {
          chart: { toolbar: { show: false } },
          xaxis: { categories },
          colors: ['#1c89ba'],
          plotOptions: {
            bar: {
              horizontal: categories.some((cat: string) => cat.length > 15)
            }
          }
        }
      };
    }
    
    if (questionAnalytics.type === 'rating' || questionAnalytics.type === 'linear_scale') {
      const values = questionAnalytics.answerDistribution.values || [];
      const histogram: { [key: string]: number } = {};
      values.forEach((val: number) => {
        histogram[val.toString()] = (histogram[val.toString()] || 0) + 1;
      });
      
      const categories = Object.keys(histogram).sort((a, b) => Number(a) - Number(b));
      const data = categories.map(cat => histogram[cat]);
      
      return {
        series: [{ name: 'Responses', data }],
        options: {
          chart: { toolbar: { show: false } },
          xaxis: { categories },
          colors: ['#16a34a'],
        }
      };
    }
    
    return { series: [], options: {} };
  };

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${survey?.result?.title || 'Survey'} - Analytics Report`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .no-print {
          display: none !important;
        }
        .print-break {
          page-break-before: always;
        }
      }
    `,
  });

  const handleExport = () => {
    if (handlePrint) {
      handlePrint();
    } else {
      toast.error('Unable to generate report. Please try again.');
    }
  };

  if (!surveyId) {
    return (
      <div className="p-6">
        <div className="text-red-600">Invalid survey - no id provided</div>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <Breadcrumb
        items={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: 'Surveys', link: '/dashboard/surveys' },
            'Analytics',
        ]}
        title={`Analytics${survey?.result?.title ? ` — ${survey?.result?.title}` : ``}`}
        className="absolute top-0 left-0 w-full px-6"
      />
      <div className="max-w-7xl mx-auto px-4 max-sm:px-2 sm:px-6 lg:px-8 pt-20 max-md:pt-24">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">Survey Analytics</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {analytics?.result ? `Analysis for ${analytics?.result?.surveyTitle}` : `Overview and detailed metrics for this survey.`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button 
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center" 
              onClick={handleExport}
            >
              <FaPrint /> <span className="hidden sm:inline">Export PDF</span><span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div ref={printRef} className="print-content">
          {/* Print Header - Only visible when printing */}
          <div className="hidden print:block mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {survey?.result?.title || 'Survey'} - Analytics Report
            </h1>
            <p className="text-gray-600 mb-4">
              Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <div className="border-b border-gray-300 mb-6"></div>
          </div>

          {/* Response Overview KPIs */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <KPICard 
                title="Total Responses" 
                value={analytics?.result?.totalResponses || 0} 
                hint="Submitted responses" 
                icon={<FaChartBar />}
                isLoading={isLoading}
              />
              <KPICard 
                title="Unique Respondents" 
                value={analytics?.result?.uniqueRespondents || 0} 
                hint="Distinct users" 
                icon={<FaUsers />}
                isLoading={isLoading}
              />
              <KPICard 
                title="Completion Rate" 
                value={analytics?.result ? formatPct(analytics.result.completionRate) : '0%'} 
                hint="Share of starters who finished" 
                icon={<FaCheckCircle />}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="mb-6">
            {/* Trends & Response Overview */}
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Response Trends</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">Daily / Weekly submissions</div>
              </div>
              <div className="overflow-hidden">
                {ChartComponent ? (
                  // @ts-ignore - ChartComponent is dynamically imported
                  (<ChartComponent options={trendsOptions} series={trendsSeries as any} type="area" height={isMobile ? 200 : 280} />)
                ) : (
                  <div className="h-[200px] sm:h-[280px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded">Loading chart...</div>
                )}
              </div>
            </div>
          </div>

          {/* Question-by-Question Analysis */}
          <div className="print-break mt-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 print:text-xl">Question Analysis</h2>

              {/* Response Count Table */}
              <div className="mb-4 sm:mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Response Counts per Question</h4>
                {analytics?.result?.questionAnalytics?.map((q: any, idx: number) => (
                  <div key={q.questionId} className="mb-6 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1 break-words">
                          {idx + 1}. {q.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded">{q.type}</span>
                          {q.required && <span className="text-red-500">Required</span>}
                        </div>
                      </div>
                      <div className="text-left sm:text-right text-xs text-gray-400 flex-shrink-0">
                        <div>Responses: {q.responseCount.toLocaleString()}</div>
                        <div>Skip Rate: {formatPct(q.skipRate)}</div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {q.type === 'single_choice' || q.type === 'multiple_choice' ? (
                        getQuestionChartData(q).series.length > 0 ? (
                          ChartComponent ? (
                            (<ChartComponent 
                              options={getQuestionChartData(q).options} 
                              series={getQuestionChartData(q).series} 
                              type={getQuestionChartData(q).options.plotOptions?.bar?.horizontal ? 'bar' : 'bar'} 
                              height={Math.max(isMobile ? 150 : 200, (getQuestionChartData(q).options.xaxis?.categories?.length || 4) * (isMobile ? 20 : 25))}
                            />)
                          ) : (
                            <div className="h-[150px] sm:h-[200px] flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded">Loading chart...</div>
                          )
                        ) : (
                          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">No responses recorded for this question.</div>
                        )
                      ) : q.type === 'rating' || q.type === 'linear_scale' ? (
                        q.answerDistribution?.values?.length > 0 ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                              <div className="p-2 bg-blue-50 rounded">
                                <div className="text-blue-600 font-medium">Average</div>
                                <div className="text-xl font-semibold">{q.answerDistribution.average.toFixed(1)}</div>
                              </div>
                              <div className="p-2 bg-green-50 rounded">
                                <div className="text-green-600 font-medium">Min</div>
                                <div className="text-xl font-semibold">{q.answerDistribution.min}</div>
                              </div>
                              <div className="p-2 bg-red-50 rounded">
                                <div className="text-red-600 font-medium">Max</div>
                                <div className="text-xl font-semibold">{q.answerDistribution.max}</div>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <div className="text-gray-600 font-medium">Count</div>
                                <div className="text-xl font-semibold">{q.answerDistribution.values.length}</div>
                              </div>
                            </div>
                            {getQuestionChartData(q).series.length > 0 && ChartComponent && (
                              // @ts-ignore
                              (<ChartComponent 
                                options={getQuestionChartData(q).options} 
                                series={getQuestionChartData(q).series} 
                                type="bar" 
                                height={isMobile ? 150 : 200}
                              />)
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">No numerical responses recorded for this question.</div>
                        )
                      ) : (
                        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded">
                          Text responses ({q.answerDistribution?.textResponses || 0} total) - available in detailed export.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};


export const Route = createFileRoute('/dashboard/surveys/$view-id/analytics')({
  component: AnalyticsPage,
});