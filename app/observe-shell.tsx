"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Bell,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

interface Props {
  projectId?: string;
  children: ReactNode;
}

export function ObserveShell({ projectId, children }: Props) {
  const pathname = usePathname();

  const projectNav: NavItem[] = projectId
    ? [
        {
          href: `/projects/${projectId}/issues`,
          label: "Issues",
          icon: <AlertTriangle className="w-4 h-4" />,
        },
        {
          href: `/projects/${projectId}/logs`,
          label: "Logs",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          href: `/projects/${projectId}/metrics`,
          label: "Metrics",
          icon: <BarChart2 className="w-4 h-4" />,
        },
        {
          href: `/projects/${projectId}/alerts`,
          label: "Alerts",
          icon: <Bell className="w-4 h-4" />,
        },
        {
          href: `/projects/${projectId}/settings`,
          label: "Settings",
          icon: <Settings className="w-4 h-4" />,
        },
      ]
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-800">
          <Link href="/projects" className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="font-semibold text-sm">Observe</span>
          </Link>
        </div>

        {/* Top nav */}
        <nav className="px-2 py-3 border-b border-gray-800">
          <NavLink
            href="/projects"
            icon={<FolderOpen className="w-4 h-4" />}
            label="Projects"
            active={pathname === "/projects"}
          />
        </nav>

        {/* Project-level nav */}
        {projectNav.length > 0 && (
          <nav className="px-2 py-3 flex-1 overflow-y-auto">
            <p className="text-xs text-gray-500 uppercase tracking-wide px-2 mb-2">Project</p>
            {projectNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </nav>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-800">
          <Link
            href="https://console.africoders.com"
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            <LayoutDashboard className="w-3 h-3" />
            Console
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-gray-700 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
