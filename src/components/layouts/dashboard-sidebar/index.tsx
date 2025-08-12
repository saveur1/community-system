import { NavItemType } from "@/utility/types";
import { Link, useLocation } from "@tanstack/react-router";
import { HiArrowNarrowLeft, HiMenuAlt3, HiX, HiCog, HiBell } from "react-icons/hi";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navItems: NavItemType[];
}

interface LogoProps {
  collapsed: boolean;
}

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
}

// Logo Component
const Logo: React.FC<LogoProps> = ({ collapsed }) => (
  <div className={`flex items-center gap-2 ${collapsed ? "hidden" : "block"}`}>
    <img
      src="/images/web_logo.png"
      alt="Acme Inc. Logo"
      className="h-8 w-auto"
    />
  </div>
);

// Navigation Item Component
const NavItem: React.FC<NavItemProps> = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.link;
  const Icon = item.icon;
  return (
    <Link
      to={item.link}
      className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors border-r-2 group relative ${
        isActive
          ? "bg-success/10 text-title border-primary font-medium"
          : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
      } ${!collapsed ? "" : "justify-center px-4"}`}
      title={collapsed ? item.name : ""}
    >
      <Icon className="w-4 h-4 opacity-70 flex-shrink-0" />
      <span className={`${collapsed ? "hidden" : "block"} transition-all duration-300`}>
        {item.name}
      </span>

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.name}
        </div>
      )}
    </Link>
  );
};

// Sidebar Component
const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
}) => {

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <nav
        className={`
          ${sidebarOpen ? "w-64" : "w-16"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-white border-r border-gray-200 fixed h-screen flex flex-col z-50 transition-all duration-300 ease-in-out
        `}
      >
        {/* Top section */}
        <div>
          {/* Logo and Toggle */}
          <div
            className={`p-5 border-b border-gray-100 flex items-center ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <Logo collapsed={!sidebarOpen} />

            {/* Desktop toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex cursor-pointer p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <HiArrowNarrowLeft size={20} className="text-title" />
              ) : (
                <HiMenuAlt3 className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
              aria-label="Close menu"
            >
              <HiX className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <div className="py-4">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>
        </div>

        {/* Bottom section with Settings and Notifications */}
        <div className="mt-auto border-t border-gray-200">
          <div className="py-2">
            {/* Settings Link */}
            <Link
              to="/dashboard/settings"
              className={`
                flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 cursor-pointer
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <HiCog className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">Settings</span>
              )}
            </Link>

            {/* Notifications Link */}
            <Link
              to="/dashboard/notifications"
              className={`
                flex items-center gap-3 px-5 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 cursor-pointer relative
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <div className="relative">
                <HiBell className="w-5 h-5 flex-shrink-0" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-3 h-3 text-xs font-bold text-white bg-red-500 rounded-full"></span>
              </div>
              {sidebarOpen && (
                <span className="font-medium">Notifications</span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;