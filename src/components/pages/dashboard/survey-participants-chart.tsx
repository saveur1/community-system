import React from "react";
import ReactApexChart from "react-apexcharts";
import { SelectDropdown } from "@/components/ui/select";

type SurveyParticipantsProps = {
  selectedSurvey: string;
  setSelectedSurvey: (survey: string) => void;
  surveys: { id: string; name: string }[];
  chartSeries: any[];
  chartOptions: any;
};

export function SurveyParticipants({
  selectedSurvey,
  setSelectedSurvey,
  surveys,
  chartSeries,
  chartOptions,
}: SurveyParticipantsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 mb-3 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-600">
          Survey Participation Over Time
        </h2>
        <SelectDropdown
          value={selectedSurvey}
          onChange={(value) => setSelectedSurvey(value)}
          options={surveys.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select a survey..."
          dropdownClassName="min-w-56"
        />
      </div>
      <ReactApexChart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={320}
      />
    </div>
  );
}