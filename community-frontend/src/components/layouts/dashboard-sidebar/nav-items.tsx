import type { NavItemType } from "@/utility/types";
import { cn } from "@/utility/utility";
import { Link, useLocation } from "@tanstack/react-router";
import React from "react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";

interface NavItemProps {
  item: NavItemType;
  collapsed: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ item, collapsed }) => {
  const location = useLocation();
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const path = location.pathname;
  const isActive = path === item.link || (hasChildren && path.startsWith(item.link));
  const [open, setOpen] = React.useState(() => isActive);
  const Icon = item.icon;

  React.useEffect(() => {
    if (hasChildren) {
      setOpen(path === item.link || path.startsWith(item.link));
    }
  }, [path]);

  const baseClasses = `flex items-center gap-3 px-5 py-3 text-sm transition-colors border-r-3 group relative ${
    isActive ? "bg-white/20 text-white border-white font-medium" : "text-white/80 border-transparent hover:bg-white/10 hover:text-white"
  } ${!collapsed ? "" : "justify-center px-4"}`;

  if (!hasChildren) {
    return (
      <Link to={item.link} className={baseClasses} title={collapsed ? item.name : ""}>
        <Icon className="w-4 h-4 opacity-90 flex-shrink-0 text-white/80" />
        <span className={`${collapsed ? "hidden" : "block"} transition-all text-[18px] duration-300`}>
          {item.name}
        </span>
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </Link>
    );
  }

  return (
    <div className="select-none">
      <div className={baseClasses} title={collapsed ? item.name : ""}>
        {/* Parent is non-navigable when it has children; clicking toggles submenu */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
          aria-expanded={open}
        >
          {Icon && <Icon className="w-4 h-4 opacity-90 flex-shrink-0 text-white/80" />}
          <span className={`${collapsed ? "hidden" : "block"} transition-all text-[18px] duration-300`}>
            {item.name}
          </span>
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto text-white/80 hover:text-white"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
          </button>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {item.name}
          </div>
        )}
      </div>

      {!collapsed && open && (
        <div className="pl-10 pr-4 relative">
          {/* Vertical guide line */}
          <span className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-white/20" aria-hidden="true" />

          {item.children!.map((child, _) => {
            const childActive = path === child.link;
            return (
              <Link
                key={child.name}
                to={child.link}
                className={cn(
                  "group relative flex items-center gap-2 py-2 pl-6 text-sm transition-colors",
                  childActive ? "text-white font-semibold" : "text-white/80 hover:text-white"
                )}
                title={child.name}
              >
                {/* Connector from vertical line to item */}
                <span className={cn(
                  "pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 h-px w-3",
                  childActive ? "bg-white" : "bg-white/30 group-hover:bg-white/60"
                )} aria-hidden="true" />

                {/* Bullet/Dot */}
                <span
                  className={cn(
                    "w-2 h-2 rounded-full inline-block",
                    childActive ? "bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)]" : "bg-white/60 group-hover:bg-white"
                  )}
                />
                <span className="truncate">{child.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NavItem;