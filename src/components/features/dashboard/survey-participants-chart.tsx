import React, { useEffect, useMemo, useState } from "react";
import { SelectDropdown } from "@/components/ui/select";
import { useSurveysList } from "@/hooks/useSurveys";
import { useSurveysHistory } from "@/hooks/useStatistics";

export function SurveyParticipants() {
  // Dynamically load react-apexcharts on client to avoid SSR errors
  const [ChartComponent, setChartComponent] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    import("react-apexcharts")
      .then((mod) => {
        if (mounted) setChartComponent(() => mod.default);
      })
      .catch(() => {
        // ignore - chart will show placeholder
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch surveys from API
  const { data: surveysResp, isLoading: surveysLoading } = useSurveysList({
    page: 1,
    limit: 1000,
  });
  const surveysList =
    surveysResp?.result?.map((s) => ({
      id: s.id,
      name: (s as any).title ?? (s as any).name ?? "Untitled",
    })) ?? [];

  // Selected survey state
  const [selectedSurvey, setSelectedSurvey] = useState<string | undefined>(undefined);

  useEffect(() => {
    // pick first when surveys load if none selected
    if (!selectedSurvey && surveysList.length > 0) {
      setSelectedSurvey(surveysList[0].id);
    }
  }, [surveysList, selectedSurvey]);

  // Handle dropdown change
  const handleSelect = (id: string) => {
    setSelectedSurvey(id);
  };

  // Fetch statistics (surveys history) for selected survey (monthly by default)
  const historyQuery = useSurveysHistory({
    group: "monthly",
    surveyId: selectedSurvey,
  });
  const history = historyQuery.data?.result ?? { labels: [], data: [] };
  const labels: string[] = history.labels ?? [];
  const data: number[] = history.data ?? [];

  // Build chart series and options from API data
  const chartSeries = useMemo(
    () => [{ name: "Participants", type: "line", data }],
    [data]
  );

  const chartOptions = useMemo(() => {
    return {
      chart: { height: 320, type: "line", toolbar: { show: false } },
      stroke: { width: 3, curve: "smooth" },
      markers: { size: 4 },
      xaxis: { categories: labels, labels: { style: { fontSize: "12px" } } },
      grid: { show: true, borderColor: "#edf2f7" },
      tooltip: { shared: true, intersect: false },
      colors: ["#67462A"],
    };
  }, [labels]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 mb-3 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-600">
          Survey Participation Over Time
        </h2>

        <div className="w-56">
          <SelectDropdown
            value={selectedSurvey ?? ""}
            onChange={(value: string) => handleSelect(value)}
            options={surveysList.map((s) => ({ label: s.name, value: s.id }))}
            placeholder={surveysLoading ? "Loading surveys..." : "Select a survey..."}
            dropdownClassName="min-w-56"
            disabled={surveysLoading}
          />
        </div>
      </div>

      {ChartComponent ? (
        <ChartComponent
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={320}
        />
      ) : (
        <div className="h-[320px] flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded">
          Loading chart...
        </div>
      )}
    </div>
  );
}