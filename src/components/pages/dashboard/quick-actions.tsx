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
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map((q) => (
          <Link
            to={q.to}
            key={q.id}
            className="flex flex-col border border-gray-200 items-center justify-center gap-3 rounded-xl p-4 shadow hover:shadow-md transition-transform transform hover:-translate-y-1"
          >
            <div className={`${q.color} rounded-full p-3`}>{q.icon}</div>
            <div className="text-sm font-medium text-gray-700 text-center">
              {q.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
