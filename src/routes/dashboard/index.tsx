import { useMemo, useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { FaClipboardList } from "react-icons/fa";
import { createFileRoute } from "@tanstack/react-router";
import { SummaryCard } from "@/components/pages/dashboard/summary-cards";
import { SurveyParticipants } from "@/components/pages/dashboard/survey-participants-chart";
import { QuickActions } from "@/components/pages/dashboard/quick-actions";
import useAuth from "@/hooks/useAuth";
import summaryCards from "@/components/pages/dashboard/summary-cards-items";

const genMonthly = (base: number) =>
  Array.from({ length: 12 }).map((_, i) =>
    Math.max(0, Math.round(base + Math.sin(i / 2) * base * 0.25 + i * 2))
  );

const surveys = [
  { id: "all", name: "All Surveys" },
  { id: "immunization", name: "Immunization Feedback" },
  { id: "maternal", name: "Maternal Health" },
  { id: "facility", name: "Facility Feedback" },
];

const mockData: Record<string, number[]> = {
  all: genMonthly(60),
  immunization: genMonthly(40),
  maternal: genMonthly(30),
  facility: genMonthly(18),
};

function DashboardHome() {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("immunization");
  const { user } = useAuth();

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartSeries = [
    { name: "Participants", type: "line", data: mockData[selectedSurvey] },
  ];

  const chartOptions: any = {
    chart: { height: 320, type: "line", toolbar: { show: false } },
    stroke: { width: 3, curve: "smooth" },
    markers: { size: 4 },
    xaxis: { categories: months, labels: { style: { fontSize: "12px" } } },
    grid: { show: true, borderColor: "#edf2f7" },
    tooltip: { shared: true, intersect: false },
    colors: ["#67462A"],
  };

  const quickLinks = [
    { id: "users", label: "Users", icon: <HiOutlineUsers size={22} />, to: "/dashboard/users", color: "bg-blue-100" },
    { id: "surveys", label: "Surveys", icon: <FaClipboardList size={22} />, to: "/dashboard/surveys", color: "bg-teal-100" },
    { id: "reports", label: "Reports", icon: <HiOutlineChartBar size={22} />, to: "/dashboard/reports", color: "bg-sky-100" },
    { id: "pending", label: "Pending Approvals", icon: <HiOutlineClock size={22} />, to: "/dashboard/pending", color: "bg-amber-100" },
    { id: "complaints", label: "Complaints", icon: <HiOutlineXCircle size={22} />, to: "/dashboard/complaints", color: "bg-rose-100" },
    { id: "docs", label: "Guides", icon: <HiOutlineDocumentText size={22} />, to: "/dashboard/docs", color: "bg-violet-100" },
  ];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summaryCards(user)?.map((card) => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <SurveyParticipants
            selectedSurvey={selectedSurvey}
            setSelectedSurvey={setSelectedSurvey}
            surveys={surveys}
            chartSeries={chartSeries}
            chartOptions={chartOptions}
          />
        </div>
        <div className="col-span-12 lg:col-span-3">
          <QuickActions quickLinks={quickLinks} />
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});