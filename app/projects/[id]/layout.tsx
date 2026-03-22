"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  FileText,
  LayoutDashboard,
  Settings,
  Tag,
  Zap,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
  children: ReactNode;
}

export default function ProjectLayout({ params, children }: Props) {
  const { id } = use(params);
  const pathname = usePathname();

  const tabs = [
    { href: `/projects/${id}`, label: "Overview", icon: <LayoutDashboard className="w-4 h-4" />, exact: true },
    { href: `/projects/${id}/issues`, label: "Issues", icon: <AlertTriangle className="w-4 h-4" /> },
    { href: `/projects/${id}/logs`, label: "Logs", icon: <FileText className="w-4 h-4" /> },
    { href: `/projects/${id}/performance`, label: "Performance", icon: <Zap className="w-4 h-4" /> },
    { href: `/projects/${id}/metrics`, label: "Metrics", icon: <BarChart2 className="w-4 h-4" /> },
    { href: `/projects/${id}/alerts`, label: "Alerts", icon: <Bell className="w-4 h-4" /> },
    { href: `/projects/${id}/releases`, label: "Releases", icon: <Tag className="w-4 h-4" /> },
    { href: `/projects/${id}/settings`, label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <nav className="border-b border-gray-800 px-4 sm:px-8 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? "border-green-500 text-white"
                    : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
                }`}
              >
                {tab.icon}
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
      {children}
    </div>
  );
}
