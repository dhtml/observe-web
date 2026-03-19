"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { AlertTriangle, Activity } from "lucide-react";
import { listGroups, updateGroup, type ErrorGroup } from "@/lib/api";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "unresolved", label: "Unresolved" },
  { value: "resolved", label: "Resolved" },
  { value: "ignored", label: "Ignored" },
];

const LEVEL_COLORS: Record<string, string> = {
  error: "text-red-400 bg-red-950",
  warning: "text-yellow-400 bg-yellow-950",
  info: "text-blue-400 bg-blue-950",
  debug: "text-gray-400 bg-gray-800",
  critical: "text-purple-400 bg-purple-950",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function IssuesPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [groups, setGroups] = useState<ErrorGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("unresolved");
  const [level, setLevel] = useState("");

  function load() {
    setLoading(true);
    listGroups(projectId, { status, level, limit: 50 })
      .then((r) => {
        setGroups(r.groups);
        setTotal(r.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, status, level]);

  async function resolve(groupId: string) {
    await updateGroup(projectId, groupId, { status: "resolved" });
    load();
  }

  async function ignore(groupId: string) {
    await updateGroup(projectId, groupId, { status: "ignored" });
    load();
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Issues</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} groups</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex bg-gray-800 rounded-md overflow-hidden">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                status === tab.value
                  ? "bg-gray-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1.5 focus:outline-none"
        >
          <option value="">All Levels</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
          <option value="critical">Critical</option>
          <option value="debug">Debug</option>
        </select>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
        </div>
      )}

      {!loading && groups.length === 0 && (
        <div className="text-center py-16">
          <AlertTriangle className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No issues found.</p>
        </div>
      )}

      <div className="space-y-2">
        {groups.map((g) => (
          <div
            key={g.id}
            className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
                      LEVEL_COLORS[g.level] ?? "text-gray-400 bg-gray-800"
                    }`}
                  >
                    {g.level}
                  </span>
                  <Link
                    href={`/projects/${projectId}/issues/${g.id}`}
                    className="font-medium text-white hover:text-green-400 truncate max-w-lg text-sm"
                  >
                    {g.title}
                  </Link>
                </div>
                <p className="text-xs text-gray-500 font-mono truncate">{g.culprit}</p>
                {g.ai_summary && (
                  <p className="text-xs text-gray-400 mt-1 italic">{g.ai_summary}</p>
                )}
              </div>

              <div className="flex-shrink-0 text-right space-y-1">
                <p className="text-sm font-bold text-white">{g.event_count.toLocaleString()}</p>
                <p className="text-xs text-gray-500">events</p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1">
                {g.status !== "resolved" && (
                  <button
                    onClick={() => resolve(g.id)}
                    className="text-xs px-2 py-1 bg-gray-800 hover:bg-green-900 text-gray-400 hover:text-green-300 rounded transition-colors"
                  >
                    Resolve
                  </button>
                )}
                {g.status !== "ignored" && (
                  <button
                    onClick={() => ignore(g.id)}
                    className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-300 rounded transition-colors"
                  >
                    Ignore
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>
                First: {new Date(g.first_seen).toLocaleDateString()}
              </span>
              <span>
                Last: {new Date(g.last_seen).toLocaleString()}
              </span>
              {g.assigned_to && (
                <span className="text-gray-400">Assigned: {g.assigned_to}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
