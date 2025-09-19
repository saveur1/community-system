import AuthLoader from '@/components/common/auth-loader';
import MainContent from '@/components/layouts/dashboard-main-content';
import Sidebar from '@/components/layouts/dashboard-sidebar';
import ImigongoStarter from '@/components/layouts/imigongo-starter';
import Header from '@/components/features/dashboard/dashboard-header';
import navItems from '@/components/features/dashboard/dashboard-sidebar-items';
import useAuth from '@/hooks/useAuth';
import { createFileRoute, useLocation } from '@tanstack/react-router'
import { useState } from 'react';
import ContentFooter from '@/components/layouts/dashboard-main-content/content-footer';


export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})


function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const { user } = useAuth();


  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        navItems={navItems(user, path)}
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
            <ContentFooter />
          </MainContent>
        </div>
        <ImigongoStarter />
      </div>

    </div>
  );
}