import { HiOutlineUsers, HiOutlineCollection } from "react-icons/hi";
import { FaRegComments } from "react-icons/fa";
import { MdBrokenImage } from 'react-icons/md';
import { TiMessages } from 'react-icons/ti';
import { calculateDelta, checkPermissions, getDateRange } from '@/utility/logicFunctions';
import { SiLimesurvey } from 'react-icons/si';
import { useStatisticsOverview } from '@/hooks/useStatistics';
import useAuth from '@/hooks/useAuth';
import { useMemo } from 'react';
import { SummaryCardProps } from "./summary-cards";


const summaryCards = (): SummaryCardProps[] => {
  const { current: weekCurrent } = useMemo(() => getDateRange("This week"), []);
  const { current: yearCurrent } = useMemo(() => getDateRange("This year"), []);
  const { user } = useAuth();

  // Fetch overview stats for the yearly and weekly periods
  const { data: overviewYearResp } = useStatisticsOverview({
    startDate: yearCurrent.start.toISOString(),
    endDate: yearCurrent.end.toISOString(),
  });
  const { data: overviewWeekResp } = useStatisticsOverview({
    startDate: weekCurrent.start.toISOString(),
    endDate: weekCurrent.end.toISOString(),
  });

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
}

export default summaryCards;