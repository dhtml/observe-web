"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { Activity, Search } from "lucide-react";
import { listLogs, type LogEvent } from "@/lib/api";

const LEVEL_COLORS: Record<string, string> = {
  debug: "text-gray-400",
  info: "text-blue-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  critical: "text-purple-400",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function LogsPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    listLogs(projectId, { level, search, limit: 100 })
      .then((r) => setLogs(r.logs))
      .finally(() => setLoading(false));
  }, [projectId, level, search]);

  useEffect(() => {
    load();
  }, [load]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Logs</h2>
          <p className="text-sm text-gray-500 mt-0.5">Structured log events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1.5 focus:outline-none"
        >
          <option value="">All Levels</option>
          <option value="debug">Debug</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="critical">Critical</option>
        </select>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search messages…"
            className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md px-3 py-1.5 w-60 focus:outline-none focus:ring-1 focus:ring-green-600 placeholder-gray-600"
          />
          <button
            type="submit"
            className="p-1.5 bg-gray-800 border border-gray-700 rounded-md text-gray-400 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
        </div>
      )}

      {!loading && logs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No logs found.</p>
        </div>
      )}

      {/* Log stream */}
      <div className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden font-mono text-xs">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}

function LogRow({ log }: { log: LogEvent }) {
  const [expanded, setExpanded] = useState(false);
  const color = LEVEL_COLORS[log.level] ?? "text-gray-400";

  return (
    <div
      className="border-b border-gray-800 last:border-0 hover:bg-gray-900 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 px-4 py-2">
        <span className="text-gray-600 w-36 flex-shrink-0 pt-px">
          {new Date(log.received_at).toLocaleTimeString()}
        </span>
        <span className={`w-16 flex-shrink-0 uppercase font-bold ${color}`}>
          {log.level}
        </span>
        {log.service && (
          <span className="text-gray-500 w-20 flex-shrink-0 truncate">{log.service}</span>
        )}
        <span className="text-gray-300 flex-1 break-all">{log.message}</span>
        {log.trace_id && (
          <span className="text-gray-600 flex-shrink-0 truncate max-w-24">{log.trace_id}</span>
        )}
      </div>
      {expanded && log.attributes && (
        <div className="px-4 pb-2 pl-56">
          <pre className="text-green-300 bg-black rounded p-2 overflow-x-auto text-xs">
            {JSON.stringify(log.attributes, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
