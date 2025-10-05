import type { NavItemType } from '@/utility/types';
import { FaQuestionCircle, FaUserFriends } from 'react-icons/fa';
import {
  HiChartBar,
  HiClipboardList,
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";
import type { User } from '@/api/auth';
import { checkPermissions } from '@/utility/logicFunctions';
import { IoIosVideocam } from 'react-icons/io';
import { PiSpeakerSimpleHighBold } from 'react-icons/pi';
import { GrProjects } from "react-icons/gr";

const navItems = (user: User | null, path: string): NavItemType[] => {
  const navigationItems: NavItemType[] = [
    { name: "Dashboard", icon: HiChartBar, active: true, link: `/${path}` },
    { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: `/${path}/feedback` },
  ]

  if (checkPermissions(user, 'survey:create')) {
    const surveyItem = {
      name: "Surveys",
      icon: HiClipboardList,
      active: false,
      link: `/${path}/surveys`,
      children: [
        { name: "Manage Surveys", active: false, link: `/${path}/surveys`, icon: HiClipboardList },
        { name: "Take Survey", active: false, link: `/${path}/surveys/take-survey`, icon: HiClipboardList },
      ]
    }

    if(checkPermissions(user, 'rapid_enquiry:create')) {
      surveyItem.children.push({ name: "Rapid Enquiry", active: false, link: `/${path}/surveys/rapid-enquiry`, icon: FaQuestionCircle });
    }
    
    navigationItems.push(surveyItem)
  }
  else {
    navigationItems.push({ name: "Surveys", icon: HiClipboardList, active: false, link: `/${path}/surveys/take-survey` })
  }

  if (checkPermissions(user, 'project:create')) {
    navigationItems.push({ name: "Projects", icon: GrProjects, active: false, link: `/${path}/projects` })
  }

  if (checkPermissions(user, 'user:read')) {
    navigationItems.push({
      name: "Accounts",
      icon: FaUserFriends,
      active: false,
      link: `/${path}/accounts`,
      children: [
        { name: "All", active: false, link: `/${path}/accounts`, icon: FaUserFriends },
        { name: "Stakeholders", active: false, link: `/${path}/accounts/stakeholders`, icon: FaUserFriends },
        { name: "RICH Members", active: false, link: `/${path}/accounts/rich-members`, icon: FaUserFriends },
        { name: "Community Members", active: false, link: `/${path}/accounts/community-members`, icon: FaUserFriends },
        { name: "Health service", active: false, link: `/${path}/accounts/health-service-providers`, icon: FaUserFriends },
      ],
    })
  }

  if (checkPermissions(user, 'survey:forms')) {
    const dataCollections = {
      name: "Data Collection ",
      icon: FaUserFriends,
      active: false,
      link: `/${path}/reporting`,
      children: [
        { name: "Manage Forms", active: false, link: `/${path}/reporting/report-forms`, icon: HiClipboardList },
        { name: "Collect data", active: false, link: `/${path}/reporting`, icon: HiClipboardList },
      ]
    }
    
    navigationItems.push(dataCollections)
  }
  else if (checkPermissions(user, 'report:create')) {
    navigationItems.push({ name: "Data Collection", icon: FaUserFriends, active: false, link: `/${path}/reporting` })
  }

  if (checkPermissions(user, "community_session:read")) {
    navigationItems.push({ name: "Community Sessions", icon: IoIosVideocam, active: false, link: `/${path}/community-sessions` })
  }

  if (checkPermissions(user, "announcement:create")) {
    navigationItems.push({ name: "Announcements", icon: PiSpeakerSimpleHighBold, active: false, link: `/${path}/announcements` })
  }

  if (checkPermissions(user, 'stakeholder:create')) {
    navigationItems.push({ name: "Stakeholders", icon: FaUserFriends, active: false, link: `/${path}/stakeholders` })
  }
  return navigationItems;
};



export default navItems;