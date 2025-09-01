import { useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { FaClipboardList, FaVideo } from "react-icons/fa";
import { createFileRoute } from "@tanstack/react-router";
import { SummaryCard } from "@/components/features/dashboard/summary-cards";
import { SurveyParticipants } from "@/components/features/dashboard/survey-participants-chart";
import { QuickActions } from "@/components/features/dashboard/quick-actions";
import useAuth from "@/hooks/useAuth";
import summaryCards from "@/components/features/dashboard/summary-cards-items";
import AnnouncementCard from "@/components/features/dashboard/announcement-card";
import { checkPermissions } from "@/utility/logicFunctions";
import { toast } from "react-toastify";
import RecentUserActivities from "@/components/features/dashboard/recent-activities-summary";

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
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(true);
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

  // Define quick links with permission checks
  const quickLinks = [
    ...(checkPermissions(user, "user:create")
      ? [
          { id: "accounts", label: "Accounts", icon: <HiOutlineUsers size={22} />, to: "/dashboard/accounts", color: "bg-blue-100" },
          { id: "pending", label: "Pending Approvals", icon: <HiOutlineClock size={22} />, to: "/dashboard/pending", color: "bg-amber-100" },
        ]
      : []),
    ...(checkPermissions(user, "survey:respond")
      ? [{ id: "surveys", label: "Surveys", icon: <FaClipboardList size={22} />, to: "/dashboard/surveys", color: "bg-teal-100" }]
      : []),
    ...(checkPermissions(user, "report:create")
      ? [{ id: "reports", label: "Reports", icon: <HiOutlineChartBar size={22} />, to: "/dashboard/reporting", color: "bg-sky-100" }]
      : []),
    ...(checkPermissions(user, "feedback:create")
      ? [{ id: "feedbacks", label: "Feedbacks", icon: <HiOutlineXCircle size={22} />, to: "/dashboard/feedback", color: "bg-rose-100" }]
      : []),
    ...(checkPermissions(user, "community_session:read")
      ? [{ id: "community_sessions", label: "Community Sessions", icon: <FaVideo size={22} />, to: "/dashboard/community-sessions", color: "bg-rose-100" }]
      : []),
    { id: "docs", label: "Guides", icon: <HiOutlineDocumentText size={22} />, to: "/dashboard/docs", color: "bg-violet-100" },
  ];

  const handleAnnouncementAction = () => {
    toast.info("Announcement action clicked");
  };

  return (
    <div className="mt-6">
      {/* Announcement Card */}
      <AnnouncementCard
        type="primary"
        title="🎉 New Feature Available!"
        message="We've just released our new advanced analytics dashboard with real-time survey insights and enhanced reporting capabilities. Check it out now!"
        isVisible={showAnnouncement}
        onDismiss={() => setShowAnnouncement(false)}
        actionButton={{
          text: "View Details",
          onClick: handleAnnouncementAction,
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summaryCards(user)?.map((card) => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts or Recent Activities and Quick Actions */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          {checkPermissions(user, "dashboard:analytics") ? (
            
            <SurveyParticipants
              selectedSurvey={selectedSurvey}
              setSelectedSurvey={setSelectedSurvey}
              surveys={surveys}
              chartSeries={chartSeries}
              chartOptions={chartOptions}
            />
          ) : (
            <RecentUserActivities />
          )}
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