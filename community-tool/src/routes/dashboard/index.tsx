import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  HiOutlineUsers,
  HiOutlineCollection,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { FaClipboardList, FaRegComments } from "react-icons/fa";
import { Link, createFileRoute } from "@tanstack/react-router";

type SummaryCard = {
  id: string;
  title: string;
  value: string | number;
  delta: number; // percent change
  note?: string;
  icon?: React.ReactNode;
};

const surveys = [
  { id: "all", name: "All Surveys" },
  { id: "immunization", name: "Immunization Feedback" },
  { id: "maternal", name: "Maternal Health" },
  { id: "facility", name: "Facility Feedback" },
];

// helper to generate mock monthly data
const genMonthly = (base: number) =>
  Array.from({ length: 12 }).map((_, i) =>
    Math.max(0, Math.round(base + Math.sin(i / 2) * base * 0.25 + i * 2))
  );

const mockData: Record<string, number[]> = {
  all: genMonthly(60),
  immunization: genMonthly(40),
  maternal: genMonthly(30),
  facility: genMonthly(18),
};

function DashboardHome() {
  const [selectedSurvey, setSelectedSurvey] = useState<string>("immunization");

  const summaryCards: SummaryCard[] = useMemo(
    () => [
      {
        id: "feedbacks",
        title: "Feedbacks — Immunization",
        value: 345,
        delta: 20.3,
        note: "12 new this week",
        icon: <FaRegComments size={20} />,
      },
      {
        id: "users",
        title: "Registered Users",
        value: 1280,
        delta: -8.73,
        note: "5 new today",
        icon: <HiOutlineUsers size={20} />,
      },
      {
        id: "active",
        title: "Active Surveys",
        value: 7,
        delta: 10.73,
        note: "2 launched this month",
        icon: <HiOutlineCollection size={20} />,
      }
    ],
    []
  );

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const chartSeries = [
    {
      name: "Participants",
      type: "line",
      data: mockData[selectedSurvey],
    },
    {
      name: "Sessions",
      type: "column",
      data: mockData[selectedSurvey].map((v) => Math.round(v * 0.6)),
    },
  ];

  const chartOptions: any = {
    chart: {
      height: 320,
      type: "line",
      toolbar: { show: false },
    },
    stroke: { width: [3, 0], curve: "smooth" },
    markers: { size: 4 },
    xaxis: {
      categories: months,
      labels: { style: { fontSize: "12px" } },
    },
    yaxis: [{}, { opposite: true }],
    grid: { show: true, borderColor: "#edf2f7" },
    tooltip: { shared: true, intersect: false },
    colors: ["#67462A", "#1c89ba"],
    fill: { type: ["solid", "solid"], gradient: { shadeIntensity: 1 } },
  };

  const quickLinks = [
    { id: "users", label: "Users", icon: <HiOutlineUsers size={22} />, to: "/users", color: "bg-blue-100", dot: "bg-blue-500" },
    { id: "surveys", label: "Surveys", icon: <FaClipboardList size={22} />, to: "/surveys", color: "bg-teal-100", dot: "bg-teal-400" },
    { id: "reports", label: "Reports", icon: <HiOutlineChartBar size={22} />, to: "/reports", color: "bg-sky-100", dot: "bg-sky-500" },
    { id: "pending", label: "Pending Approvals", icon: <HiOutlineClock size={22} />, to: "/pending", color: "bg-amber-100", dot: "bg-amber-400" },
    { id: "complaints", label: "Complaints", icon: <HiOutlineXCircle size={22} />, to: "/complaints", color: "bg-rose-100", dot: "bg-rose-500" },
    { id: "docs", label: "Guides", icon: <HiOutlineDocumentText size={22} />, to: "/guides", color: "bg-violet-100", dot: "bg-violet-500" },
  ];

  return (
    <div className="mt-6">
      <div className="mb-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {summaryCards.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl text-gray-500">{c.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm text-gray-700 font-medium">{c.title}</h3>
                      <div
                        className={`text-sm font-medium flex items-center gap-2 ${
                          c.delta > 0 ? "text-emerald-500" : c.delta < 0 ? "text-rose-500" : "text-amber-500"
                        }`}
                      >
                        {c.delta > 0 ? "▲" : c.delta < 0 ? "▼" : "▶"} {Math.abs(c.delta)}%
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-semibold text-gray-900">{c.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{c.note}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        {/* Main content area (left, spans 9 cols) */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {/* Chart card */}
          <div className="bg-white rounded-2xl border border-gray-200 mb-10 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-600">Survey Participation Over Time</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedSurvey}
                  onChange={(e) => setSelectedSurvey(e.target.value)}
                  className="border border-gray-300 outline-none rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {surveys.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={320} />
            </div>
          </div>
        </div>

        {/* Right column quick links */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {quickLinks.map((q) => (
                <Link
                  to={q.to}
                  key={q.id}
                  className="flex flex-col border border-gray-200 items-center justify-center gap-3 rounded-xl p-4 shadow hover:shadow-md transition-transform transform hover:-translate-y-1"
                >
                  <div className={`${q.color} rounded-full p-3`}>{q.icon}</div>
                  <div className="text-sm font-medium text-gray-700 text-center">{q.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardHome,
})
