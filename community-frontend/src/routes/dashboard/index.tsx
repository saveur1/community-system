import { useEffect, useState, useMemo } from "react";
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineDocumentText,
  HiOutlineCollection,
} from "react-icons/hi";
import { FaClipboardList, FaVideo, FaRegComments } from "react-icons/fa";
import { MdBrokenImage } from 'react-icons/md';
import { TiMessages } from 'react-icons/ti';
import { SiLimesurvey } from 'react-icons/si';
import { createFileRoute } from "@tanstack/react-router";
import { SummaryCard } from "@/components/features/dashboard/summary-cards";
import { SurveyParticipants } from "@/components/features/dashboard/survey-participants-chart";
import { QuickActions } from "@/components/features/dashboard/quick-actions";
import useAuth from "@/hooks/useAuth";
import AnnouncementCard from "@/components/features/dashboard/announcement-card";
import { checkPermissions, getDateRange } from "@/utility/logicFunctions";
import RecentUserActivities from "@/components/features/dashboard/recent-activities-summary";
import { useAnnouncementsList } from "@/hooks/useAnnouncements";
import { useStatisticsOverview } from '@/hooks/useStatistics';

function DashboardHome() {
  const { user } = useAuth();

  // Date ranges for statistics
  const { current: weekCurrent } = useMemo(() => getDateRange("This week"), []);
  const { current: yearCurrent } = useMemo(() => getDateRange("This year"), []);

  // Fetch overview stats for the yearly and weekly periods
  const { data: overviewYearResp } = useStatisticsOverview({
    startDate: yearCurrent.start.toISOString(),
    endDate: yearCurrent.end.toISOString(),
  });
  const { data: overviewWeekResp } = useStatisticsOverview({
    startDate: weekCurrent.start.toISOString(),
    endDate: weekCurrent.end.toISOString(),
  });

  // Summary cards logic moved from summaryCards function
  const summaryCardsData = useMemo(() => {
    const overviewYear = overviewYearResp?.result;
    const overviewWeek = overviewWeekResp?.result;

    // TOTAL FEEDBACKS
    const feedbacksCount = overviewYear?.feedbacks?.count ?? 0;
    const feedbacksDelta = overviewYear?.feedbacks?.deltaPercent ?? 0;

    // LOGGEDIN USER FEEDBACKS
    const userFeedbackCount = overviewYear?.feedbacks?.userCount ?? null;
    const userFeedbackDelta = overviewYear?.feedbacks?.userDeltaPercent ?? null;

    // REGISTERED USERS
    const usersTotal = overviewYear?.users?.total ?? 0;
    const usersDelta = overviewYear?.users?.createdDeltaPercent ?? null;

    // ACTIVE SURVEYS & SURVEYS CREATED
    const activeSurveysNow = overviewWeek?.surveys?.activeNow ?? overviewYear?.surveys?.activeNow ?? 0;
    const surveysCreatedThisPeriod = overviewYear?.surveys?.createdInPeriod ?? 0;

    // computed deltas
    const surveysCreatedDelta = overviewYear?.surveys?.createdDeltaPercent ?? 0;
    
    const availableSurveysDelta = surveysCreatedDelta;
    const availableSurveysCount = activeSurveysNow;

    // RESPONDED SURVEYS BY USER
    const respondedSurveysByUser = overviewYear?.surveys?.respondedByUser ?? null;
    const respondedSurveysDelta = overviewYear?.surveys?.respondedDeltaPercent ?? null;

    // Analytics cards
    if (checkPermissions(user, 'dashboard:analytics')) {
      return [
        {
          id: "feedbacks",
          title: "Feedbacks",
          value: feedbacksCount,
          delta: feedbacksDelta,
          icon: FaRegComments,
          iconBgColor: "bg-primary",
          period: "This Year",
        },
        {
          id: "users",
          title: "Registered Users",
          value: usersTotal,
          delta: usersDelta || 0,
          icon: HiOutlineUsers,
          iconBgColor: "bg-title",
          period: "This year",
        },
        {
          id: "active",
          title: "Active Surveys",
          value: availableSurveysCount,
          delta: availableSurveysDelta,
          icon: HiOutlineCollection,
          iconBgColor: "bg-success",
          period: "This week",
        },
      ];
    }

    // Community Dashboard summary cards
    if (checkPermissions(user, "dashboard:community")) {
      return [
        {
          id: "surveys",
          title: "Responded Surveys",
          value: respondedSurveysByUser || 0,
          delta: respondedSurveysDelta || 0,
          icon: SiLimesurvey,
          iconBgColor: "bg-success",
          period: "This year",
        },
        {
          id: "feedback",
          title: "Your Feedbacks",
          value: userFeedbackCount || 0,
          delta: userFeedbackDelta || 0,
          icon: TiMessages,
          iconBgColor: "bg-title",
          period: "This year",
        },
        {
          id: "active",
          title: "New Surveys",
          value: availableSurveysCount,
          delta: availableSurveysDelta,
          icon: HiOutlineCollection,
          iconBgColor: "bg-primary",
          period: "This week",
        },
      ];
    }

    // Default statistics cards (safe fallbacks)
    return [
      {
        id: "surveys",
        title: "Responded Surveys",
        value: surveysCreatedThisPeriod || 0,
        delta: surveysCreatedDelta || 0,
        icon: SiLimesurvey,
        iconBgColor: "bg-success",
        period: "This Year",
      },
      {
        id: "feedback",
        title: "Feedbacks",
        value: feedbacksCount,
        delta: feedbacksDelta,
        icon: MdBrokenImage,
        iconBgColor: "bg-title",
        period: "This year",
      },
      {
        id: "active",
        title: "Active Surveys",
        value: availableSurveysCount,
        delta: availableSurveysDelta,
        icon: HiOutlineCollection,
        iconBgColor: "bg-primary",
        period: "This week",
      },
    ];
  }, [overviewYearResp, overviewWeekResp, user]);

  // Define quick links with permission checks
  const quickLinks = [
    ...(checkPermissions(user, "user:create")
      ? [
          { id: "accounts", label: "Accounts", icon: <HiOutlineUsers size={22} />, to: "/dashboard/accounts", color: "bg-blue-100" },
          { id: "pending", label: "Pending Approvals", icon: <HiOutlineClock size={22} />, to: "/dashboard/pending", color: "bg-amber-100" },
        ]
      : []),
    ...(checkPermissions(user, "survey:respond")
      ? [{ id: "surveys", label: "Surveys", icon: <FaClipboardList size={22} />, to: "/dashboard/surveys/take-survey", color: "bg-teal-100" }]
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

  // Fetch latest announcement for this user
  const { data: announcementsResp, isLoading: announcementsLoading } = useAnnouncementsList({
    allowed: true,
    status: "sent",
    limit: 1,
    page: 1
  });

  // Announcement visibility state
  const [activeAnnouncement, setActiveAnnouncement] = useState<{
    id: string;
    title: string;
    message: string;
    viewDetailsLink?: string | null;
  } | null>(null);

  // Load latest announcement if not dismissed
  useEffect(() => {
    if (!announcementsLoading && announcementsResp?.result?.[0]) {
      const latest = announcementsResp.result[0];
      
      // Check if this announcement was dismissed (using local storage)
      const dismissedAnnouncements = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}');
      
      if (!dismissedAnnouncements[latest.id]) {
        setActiveAnnouncement({
          id: latest.id,
          title: latest.title,
          message: latest.message,
          viewDetailsLink: latest.viewDetailsLink
        });
      }
    }
  }, [announcementsLoading, announcementsResp]);

  const handleDismissAnnouncement = () => {
    if (activeAnnouncement?.id) {
      // Save to localStorage
      const dismissed = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '{}');
      dismissed[activeAnnouncement.id] = new Date().toISOString();
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissed));
      
      // Update state
      setActiveAnnouncement(null);
    }
  };

  const handleAnnouncementAction = () => {
    if (activeAnnouncement?.viewDetailsLink) {
      window.open(activeAnnouncement.viewDetailsLink, '_blank');
    }
  };

  return (
    <div className="mt-6">
      {/* Dynamic Announcement Card */}
      {activeAnnouncement && (
        <AnnouncementCard
          type="primary"
          title={activeAnnouncement.title}
          message={activeAnnouncement.message}
          isVisible={true}
          onDismiss={handleDismissAnnouncement}
          actionButton={activeAnnouncement.viewDetailsLink ? {
            text: "View Details",
            onClick: handleAnnouncementAction,
          } : undefined}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {summaryCardsData?.map((card) => (
          <SummaryCard key={card.id} {...card} />
        ))}
      </div>

      {/* Charts or Recent Activities and Quick Actions */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          {checkPermissions(user, "dashboard:analytics") ? (
            <SurveyParticipants />
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