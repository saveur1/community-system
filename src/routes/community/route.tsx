import AuthLoader from '@/components/common/auth-loader';
import MainContent from '@/components/layouts/dashboard-main-content';
import Sidebar from '@/components/layouts/dashboard-sidebar';
import ImigongoStarter from '@/components/layouts/imigongo-starter';
import Header from '@/components/pages/dashboard/dashboard-header';
import { NavItemType } from '@/utility/types';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import {
  HiChartBar,
  HiDocumentText,
  HiClipboardList,
  HiCalendar,
  HiCog
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";


export const Route = createFileRoute('/community')({
  component: DashboardLayout,
})


function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems: NavItemType[] = [
    { name: "Dashboard", icon: HiChartBar, active: true, link: "/community" },
    { name: "Surveys", icon: HiClipboardList, active: false, link: "/community/surveys" },
    { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: "/community/feedback" },
    { name: "Events", icon: HiCalendar, active: false, link: "/community/events" },
    { name: "Documents", icon: HiDocumentText, active: false, link: "/community/documents" },
    { name: "Reports", icon: HiCog, active: false, link: "/community/reports" },
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
            <AuthLoader />
          </MainContent>
        </div>
        <ImigongoStarter />
      </div>

    </div>
  );
}