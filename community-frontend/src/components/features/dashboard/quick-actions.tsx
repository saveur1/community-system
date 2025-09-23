import React from "react";
import { Link } from "@tanstack/react-router";

type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  to: string;
  color: string;
};

type QuickActionsProps = {
  quickLinks: QuickAction[];
};

export function QuickActions({ quickLinks }: QuickActionsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((q) => (
          <Link
            to={q.to}
            key={q.id}
            className="flex flex-col border border-gray-200 dark:border-gray-700 items-center justify-center gap-3 rounded-xl p-4 shadow hover:shadow-md dark:hover:shadow-lg transition-transform transform hover:-translate-y-1 bg-white dark:bg-gray-700/50"
          >
            <div className={`${q.color} dark:opacity-90 rounded-full p-3`}>{q.icon}</div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center">
              {q.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
