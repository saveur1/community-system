import { NavItemType } from "@/utility/types";
import { Link, useLocation } from "@tanstack/react-router";
import { HiArrowNarrowLeft, HiMenuAlt3, HiX } from "react-icons/hi";
import { useState } from "react";

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

interface ProfileProps {
  collapsed: boolean;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
  };
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

// Profile Component
const Profile: React.FC<ProfileProps> = ({ collapsed, user }) => {
  const displayName = `${user.firstName.charAt(0)}.${user.lastName}`;
  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 border-t border-gray-200 absolute bottom-0 left-0 w-full ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <img
        src={user.avatarUrl}
        alt={`${user.firstName} ${user.lastName}`}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      {!collapsed && (
        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-gray-900 truncate">{displayName}</span>
          <span
            className="text-xs text-gray-500 lowercase truncate"
            title={user.email}
          >
            {user.email}
          </span>
        </div>
      )}
    </div>
  );
};

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
  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "John.Doe@example.com",
    avatarUrl: "/images/avatar.svg",
  };

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

        {/* Bottom Profile */}
        <Profile collapsed={!sidebarOpen} user={user} />
      </nav>
    </>
  );
};

export default Sidebar;