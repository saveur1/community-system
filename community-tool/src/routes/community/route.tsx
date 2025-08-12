import MainContent from '@/components/layouts/dashboard-main-content';
import Sidebar from '@/components/layouts/dashboard-sidebar';
import { NavItemType } from '@/utility/types';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import React, { useState } from 'react';
import {
  HiChartBar,
  HiDocumentText,
  HiClipboardList,
  HiLightningBolt,
  HiMenuAlt3,
  HiCalendar,
  HiBell,
  HiSun,
  HiMoon,
  HiChevronDown
} from 'react-icons/hi';
import { HiChatBubbleBottomCenter } from "react-icons/hi2";

// Type Definitions

interface HeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
  toggleDarkMode?: ()=> void,
  isDarkMode: boolean
}


const Header = ({ setMobileMenuOpen, toggleDarkMode, isDarkMode = false }: HeaderProps) => (
  <header className="flex bg-white dark:bg-gray-800 border-b border-gray-200 items-center w-full justify-between px-4 py-4">
    <div className="flex items-center gap-4">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
        aria-label="Open menu"
      >
        <HiMenuAlt3 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>
      <div className="relative">
        <input
          type="text"
          placeholder="Search surveys..."
          className="pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-primary min-w-56 sm:w-64"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {/* Notifications */}
      <button
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
        aria-label="Notifications"
      >
        <HiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
          5
        </span>
      </button>
      {/* Theme Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        type="button"
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <HiSun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>
      {/* Quick Create Button */}
      <button
        className="flex items-center gap-2 px-3 lg:px-4 py-2 text-sm text-white bg-primary rounded-lg hover:bg-primary-dark cursor-pointer transition-colors"
        type="button"
      >
        <HiLightningBolt className="w-4 h-4" />
        <span className="hidden sm:inline">Quick Create</span>
        <HiChevronDown className="w-4 h-4" />
      </button>
    </div>
  </header>
);


// Main Dashboard Component
const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navItems: NavItemType[] = [
    { name: "Dashboard", icon: HiChartBar, active: true, link: "/community" },
    { name: "Surveys", icon: HiClipboardList, active: false, link: "/community/surveys" },
    { name: "Feedback", icon: HiChatBubbleBottomCenter, active: false, link: "/community/feedback" },
    { name: "Events", icon: HiCalendar, active: false, link: "/community/events" },
    { name: "Documents", icon: HiDocumentText, active: false, link: "/community/documents" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out py-0 ${
      sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
    }`}>
        <Header setMobileMenuOpen={setMobileMenuOpen} isDarkMode={false}/>
        <MainContent>
          <Outlet />
        </MainContent>
      </div>

    </div>
  );
};


export const Route = createFileRoute('/community')({
  component: DashboardLayout,
})