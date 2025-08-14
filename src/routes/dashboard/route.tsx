import MainContent from '@/components/layouts/dashboard-main-content';
import Sidebar from '@/components/layouts/dashboard-sidebar';
import ImigongoStarter from '@/components/layouts/imigongo-starter';
import Header from '@/components/pages/dashboard/dashboard-header';
import { NavItemType } from '@/utility/types';
import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import React, { useState } from 'react';
import { FaList, FaUserFriends } from 'react-icons/fa';
import {
  HiChartBar,
  HiDocumentText,
  HiClipboardList,
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";


// Main Dashboard Component
const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const path = location.pathname.split('/')[1];

  const navItems: NavItemType[] = [
    { name: "Dashboard", icon: HiChartBar, active: true, link: `/${path}` },
    { name: "Surveys", icon: HiClipboardList, active: false, link: `/${path}/surveys` },
    { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: `/${path}/feedback` },
    { name: "Programmes", icon: FaList, active: false, link: `/${path}/programmes` },
    { name: "Documents", icon: HiDocumentText, active: false, link: `/${path}/documents` },
    {
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
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header fixed at top */}
        <div className="sticky top-0 z-40">
          <ImigongoStarter />
          <Header setMobileMenuOpen={setMobileMenuOpen} isDarkMode={false} />
        </div>
        {/* Scrollable content area */}
        <div className="h-[calc(100vh-109px)] overflow-y-auto">
          {/* Optional top decorative band inside scroll if desired */}
          <MainContent>
            <Outlet />
          </MainContent>
        </div>
        <ImigongoStarter />
      </div>

    </div>
  );
};


export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})