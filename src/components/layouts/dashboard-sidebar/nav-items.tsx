import { NavItemType } from "@/utility/types";
import { Link, useLocation } from "@tanstack/react-router";


interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
}

// Navigation Item Component
const NavItem: React.FC<NavItemProps> = ({ item, collapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.link;
  const Icon = item.icon;
  return (
    <Link
      to={item.link}
      className={`flex items-center gap-3 px-5 py-3 text-sm transition-colors border-r-3 group relative ${isActive
          ? "bg-white/20 text-white border-white font-medium"
          : "text-white/80 border-transparent hover:bg-white/10 hover:text-white"
        } ${!collapsed ? "" : "justify-center px-4"}`}
      title={collapsed ? item.name : ""}
    >
      <Icon className="w-4 h-4 opacity-90 flex-shrink-0 text-white/80" />
      <span className={`${collapsed ? "hidden" : "block"} transition-all text-[18px] duration-300`}>
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

export default NavItem