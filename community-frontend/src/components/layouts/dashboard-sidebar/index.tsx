import type { NavItemType } from "@/utility/types";
import { Link } from "@tanstack/react-router";
import { HiArrowNarrowLeft, HiMenuAlt3, HiX, HiCog } from "react-icons/hi";
import NavItem from "./nav-items";
import Avatar from "@/components/common/avatar";
import { IoIosNotifications } from "react-icons/io";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navItems: NavItemType[];
}

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
      <nav
        className={`
          ${sidebarOpen ? "w-64" : "w-16"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-primary text-white fixed h-screen flex flex-col z-50 transition-all duration-300 ease-in-out
        `}
      >
        {/* Top section */}
        <div>
          {/* Logo and Toggle */}
          <div
            className={`p-5 border-b border-white/30 flex items-center ${sidebarOpen ? "justify-between" : "justify-center"
              }`}
          >
            <Avatar collapsed={!sidebarOpen} />

            {/* Desktop toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex cursor-pointer p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              type="button"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <HiArrowNarrowLeft size={20} className="text-white" />
              ) : (
                <HiMenuAlt3 className="w-4 h-4 text-white" />
              )}
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              type="button"
              aria-label="Close menu"
            >
              <HiX className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Navigation */}
          <div className="py-4 h-[calc(100vh-178px)] overflow-y-auto scroll_nav">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </div>
        </div>

        {/* Bottom section with Settings and Notifications */}
        <div className="mt-auto border-t border-white/30">
          <div className="py-2">
            {/* Settings Link */}
            <Link
              to="/dashboard/notifications"
              className={`
        flex items-center gap-3 px-5 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer
        ${!sidebarOpen ? 'justify-center' : ''}
      `}
            >
              <IoIosNotifications className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">Notifications</span>
              )}
            </Link>
            {/* Settings Link */}
            <Link
              to="/dashboard/settings"
              className={`
                flex items-center gap-3 px-5 py-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer
                ${!sidebarOpen ? 'justify-center' : ''}
              `}
            >
              <HiCog className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="font-medium">Settings</span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

    </>
  );
};

export default Sidebar;