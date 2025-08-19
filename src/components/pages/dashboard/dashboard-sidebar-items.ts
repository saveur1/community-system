import { NavItemType } from '@/utility/types';
import { FaList, FaUserFriends } from 'react-icons/fa';
import {
  HiChartBar,
  HiDocumentText,
  HiClipboardList,
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";
import { User } from '@/api/auth';

const navItems = (user: User | null, path: string): NavItemType[] => {
    const navigationItems: NavItemType[] = [
      { name: "Dashboard", icon: HiChartBar, active: true, link: `/${path}` },
      { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: `/${path}/feedback` },
    ]
  
    if(user?.roles[0].permissions?.some(p => p.name === 'survey:create' || p.name === 'survey:update' || p.name === 'survey:delete')) {
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
      navigationItems.push({ name: "Surveys", icon: HiClipboardList, active: false, link: `/${path}/surveys/take` })
    }
  
    if(user?.roles[0].permissions?.some(p => p.name === 'programme:read')) {
      navigationItems.push({ name: "Programmes", icon: FaList, active: false, link: `/${path}/programmes` })
    }
  
    if(user?.roles[0].permissions?.some(p => p.name === 'document:read')) {
      navigationItems.push({ name: "Documents", icon: HiDocumentText, active: false, link: `/${path}/documents` })
    }
  
    if(user?.roles[0].permissions?.some(p => p.name === 'user:read')) {
      navigationItems.push({
        name: "Accounts",
        icon: FaUserFriends,
        active: false,
        link: `/${path}/accounts`,
        children: [
          { name: "Stakeholders", active: false, link: `/${path}/accounts/stakeholders`, icon: FaUserFriends },
          { name: "Employees", active: false, link: `/${path}/accounts/employees`, icon: FaUserFriends },
          { name: "Community", active: false, link: `/${path}/accounts/community`, icon: FaUserFriends },
          { name: "Religious", active: false, link: `/${path}/accounts/religious`, icon: FaUserFriends },
        ],
      })
    }

    if(user?.roles[0].permissions?.some(p => p.name === 'role:read')) {
      navigationItems.push({ name: "Roles", icon: FaUserFriends, active: false, link: `/${path}/roles` })
    }

    if(user?.roles[0].permissions?.some(p => p.name === 'permission:read')) {
      navigationItems.push({ name: "Permissions", icon: FaUserFriends, active: false, link: `/${path}/permissions` })
    }

    if(user?.roles[0].permissions?.some(p => p.name === 'reporting:read')) {
      navigationItems.push({ name: "Reporting", icon: FaUserFriends, active: false, link: `/${path}/reporting` })
    }
    return navigationItems;
  };



export default navItems;