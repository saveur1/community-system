import { useMemo, useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineSpeakerphone,
  HiOutlineX,
  HiOutlineInformationCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { FaClipboardList } from "react-icons/fa";
import { createFileRoute } from "@tanstack/react-router";
import { SummaryCard } from "@/components/features/dashboard/summary-cards";
import { SurveyParticipants } from "@/components/features/dashboard/survey-participants-chart";
import { QuickActions } from "@/components/features/dashboard/quick-actions";
import useAuth from "@/hooks/useAuth";
import summaryCards from "@/components/features/dashboard/summary-cards-items";

// Announcement Card Component
interface AnnouncementCardProps {
  type?: 'info' | 'warning' | 'success' | 'announcement' | 'primary';
  title: string;
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

const AnnouncementCard = ({ 
  type = 'announcement', 
  title, 
  message, 
  isVisible, 
  onDismiss,
  actionButton 
}: AnnouncementCardProps) => {
  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: <HiOutlineInformationCircle className="text-blue-500" size={24} />,
          titleColor: 'text-blue-800',
          textColor: 'text-blue-700'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: <HiOutlineExclamationCircle className="text-amber-500" size={24} />,
          titleColor: 'text-amber-800',
          textColor: 'text-amber-700'
        };
      case 'primary': 
        return {
          bg: 'bg-primary/10 border-primary',
          icon: <HiOutlineSpeakerphone className="text-primary" size={24} />,
          titleColor: 'text-primary-dark',
          textColor: 'text-primary-dark'
        };
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: <HiOutlineInformationCircle className="text-green-500" size={24} />,
          titleColor: 'text-green-800',
          textColor: 'text-green-700'
        };
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200',
          icon: <HiOutlineSpeakerphone className="text-indigo-500" size={24} />,
          titleColor: 'text-indigo-800',
          textColor: 'text-indigo-700'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} border rounded-lg p-4 mb-6 relative`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${styles.textColor}`}>
            {message}
          </p>
          {actionButton && (
            <div className="mt-3">
              <button
                onClick={actionButton.onClick}
                className={`inline-flex items-center cursor-pointer px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  type === 'info' ? 'bg-blue-100 hover:bg-blue-200 text-blue-800' :
                  type === 'warning' ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' :
                  type === 'success' ? 'bg-green-100 hover:bg-green-200 text-green-800' :
                  type === 'primary' ? 'bg-primary/20 hover:bg-primary/90 text-primary-dark hover:text-white' :
                  'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                }`}
              >
                {actionButton.text}
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/50 cursor-pointer rounded-full transition-colors"
        >
          <HiOutlineX className="text-gray-400 hover:text-gray-600" size={18} />
        </button>
      </div>
    </div>
  );
};

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

  const quickLinks = [
    { id: "users", label: "Users", icon: <HiOutlineUsers size={22} />, to: "/dashboard/users", color: "bg-blue-100" },
    { id: "surveys", label: "Surveys", icon: <FaClipboardList size={22} />, to: "/dashboard/surveys", color: "bg-teal-100" },
    { id: "reports", label: "Reports", icon: <HiOutlineChartBar size={22} />, to: "/dashboard/reports", color: "bg-sky-100" },
    { id: "pending", label: "Pending Approvals", icon: <HiOutlineClock size={22} />, to: "/dashboard/pending", color: "bg-amber-100" },
    { id: "complaints", label: "Complaints", icon: <HiOutlineXCircle size={22} />, to: "/dashboard/complaints", color: "bg-rose-100" },
    { id: "docs", label: "Guides", icon: <HiOutlineDocumentText size={22} />, to: "/dashboard/docs", color: "bg-violet-100" },
  ];

  const handleAnnouncementAction = () => {
    // Handle announcement action (e.g., navigate to updates page)
    console.log("Announcement action clicked");
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
          onClick: handleAnnouncementAction
        }}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summaryCards(user)?.map((card) => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts and Quick Actions */}
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