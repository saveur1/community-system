import { NavItemType } from '@/utility/types';
import { FaUserFriends } from 'react-icons/fa';
import {
  HiChartBar,
  HiDocumentText,
  HiClipboardList,
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";
import { User } from '@/api/auth';
import { checkPermissions } from '@/utility/logicFunctions';
import {  IoIosVideocam, IoMdSchool } from 'react-icons/io';
import { PiSpeakerSimpleHighBold, PiSubtitlesFill } from 'react-icons/pi';
import { MdHealthAndSafety } from 'react-icons/md';
import { GrProjects } from "react-icons/gr";

const navItems = (user: User | null, path: string): NavItemType[] => {
    const navigationItems: NavItemType[] = [
      { name: "Dashboard", icon: HiChartBar, active: true, link: `/${path}` },
      { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: `/${path}/feedback` },
    ]
  
    if(checkPermissions(user, 'survey:create')) {
      navigationItems.push({ 
        name: "Surveys", 
        icon: HiClipboardList, 
        active: false, 
        link: `/${path}/surveys` ,
        children: [
          { name: "Manage Surveys", active: false, link: `/${path}/surveys`, icon: HiClipboardList },
          { name: "Take Survey", active: false, link: `/${path}/surveys/take-survey`, icon: HiClipboardList },
        ]
      })
    }
    else {
      navigationItems.push({ name: "Surveys", icon: HiClipboardList, active: false, link: `/${path}/surveys/take-survey` })
    }
  
    if(checkPermissions(user, 'project:read')) {
      navigationItems.push({ name: "Projects", icon: GrProjects, active: false, link: `/${path}/projects` })
    }
  
    if(checkPermissions(user, 'document:read')) {
      navigationItems.push({ name: "Documents", icon: HiDocumentText, active: false, link: `/${path}/documents` })
    }
  
    if(checkPermissions(user, 'user:read')) {
      navigationItems.push({
        name: "Accounts",
        icon: FaUserFriends,
        active: false,
        link: `/${path}/accounts`,
        children: [
          { name: "Stakeholders", active: false, link: `/${path}/accounts/stakeholders`, icon: FaUserFriends },
          { name: "RICH Members", active: false, link: `/${path}/accounts/rich-members`, icon: FaUserFriends },
          { name: "Community Members ", active: false, link: `/${path}/accounts/community-members`, icon: FaUserFriends },
          { name: "Health service", active: false, link: `/${path}/accounts/health-service-providers`, icon: FaUserFriends },
        ],
      })
    }

    if(checkPermissions(user, 'role:read')) {
      navigationItems.push({ name: "Roles", icon: PiSubtitlesFill, active: false, link: `/${path}/roles` })
    }

    if(checkPermissions(user, 'permission:read')) {
      navigationItems.push({ name: "Permissions", icon: FaUserFriends, active: false, link: `/${path}/permissions` })
    }

    if( checkPermissions(user, 'reporting:read')) {
      navigationItems.push({ name: "Reporting", icon: FaUserFriends, active: false, link: `/${path}/reporting` })
    }

    if(checkPermissions(user, "community_session:read")) {
      navigationItems.push({ name: "Community Sessions", icon: IoIosVideocam, active: false, link: `/${path}/community-sessions` })
    }

    if(checkPermissions(user, "announcement:create")) {
      navigationItems.push({ name: "Announcements", icon: PiSpeakerSimpleHighBold, active: false, link: `/${path}/announcements` })
    }

    if(checkPermissions(user, "immunization:read")) {
      navigationItems.push({ 
        name: "Immunization", 
        icon: MdHealthAndSafety, 
        active: false, 
        link: `/${path}/immunization`, 
        children: [
          { name: "Assigned", active: false, link: `/${path}/immunization/assigned`, icon: MdHealthAndSafety },
          { name: "Report", active: false, link: `/${path}/immunization/report`, icon: MdHealthAndSafety },
          { name: "Family", active: false, link: `/${path}/immunization/family`, icon: MdHealthAndSafety },
        ]
      })
    }

    if(checkPermissions(user, "school:read")) {
      navigationItems.push({ 
        name: "School", 
        icon: IoMdSchool, 
        active: false, 
        link: `/${path}/school`, 
        children: [
          { name: "Profile", active: false, link: `/${path}/school/profile`, icon: IoMdSchool },
          { name: "Report", active: false, link: `/${path}/school/report`, icon: IoMdSchool }
        ]
      })
    }
    return navigationItems;
  };



export default navItems;