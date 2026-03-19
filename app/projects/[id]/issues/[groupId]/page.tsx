"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Cpu, CheckCircle, EyeOff } from "lucide-react";
import { getGroup, updateGroup, type ErrorGroup, type ErrorEvent } from "@/lib/api";

interface Props {
  params: Promise<{ id: string; groupId: string }>;
}

export default function IssueDetailPage({ params }: Props) {
  const { id: projectId, groupId } = use(params);
  const [group, setGroup] = useState<ErrorGroup | null>(null);
  const [events, setEvents] = useState<ErrorEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ErrorEvent | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    getGroup(projectId, groupId)
      .then((r) => {
        setGroup(r.group);
        setEvents(r.events);
        if (r.events.length > 0) setSelectedEvent(r.events[0]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, groupId]);

  async function setStatus(status: string) {
    if (!group) return;
    await updateGroup(projectId, groupId, { status });
    setGroup({ ...group, status });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
      </div>
    );
  }

  if (!group) {
    return <p className="px-8 py-8 text-gray-400">Issue not found</p>;
  }

  const payload = selectedEvent?.payload as Record<string, unknown> | undefined;

  return (
    <div className="px-8 py-8 max-w-5xl">
      <Link
        href={`/projects/${projectId}/issues`}
        className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Issues
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={group.status} />
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded font-mono">
              {group.level}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-1">{group.title}</h1>
          <p className="text-sm text-gray-500 font-mono">{group.culprit}</p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {group.status !== "resolved" && (
            <button
              onClick={() => setStatus("resolved")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-green-900 hover:bg-green-800 text-green-300 rounded-md transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </button>
          )}
          {group.status !== "ignored" && (
            <button
              onClick={() => setStatus("ignored")}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Ignore
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Events" value={group.event_count.toLocaleString()} />
        <StatCard label="Users" value={group.user_count.toLocaleString()} />
        <StatCard label="First Seen" value={fmt(group.first_seen)} />
        <StatCard label="Last Seen" value={fmt(group.last_seen)} />
      </div>

      {/* AI Summary */}
      {group.ai_summary && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-6 flex gap-2">
          <Cpu className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-300 italic">{group.ai_summary}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Event list */}
        <div className="col-span-1">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Events</h3>
          <div className="space-y-2">
            {events.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEvent(e)}
                className={`w-full text-left px-3 py-2.5 rounded-md border transition-colors text-xs ${
                  selectedEvent?.id === e.id
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700"
                }`}
              >
                <p className="font-mono mb-0.5">{e.id.slice(0, 8)}…</p>
                <p className="text-gray-500">{new Date(e.received_at).toLocaleString()}</p>
                <p className="text-gray-500">{e.environment}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Event detail */}
        <div className="col-span-2">
          {selectedEvent && (
            <>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Event Detail</h3>
              <div className="bg-gray-900 border border-gray-800 rounded-lg">
                {/* Meta */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 border-b border-gray-800 text-xs">
                  <KV k="Environment" v={selectedEvent.environment} />
                  <KV k="Platform" v={selectedEvent.platform} />
                  <KV k="Level" v={selectedEvent.level} />
                  {selectedEvent.release && <KV k="Release" v={selectedEvent.release} />}
                  {selectedEvent.user_id && <KV k="User ID" v={selectedEvent.user_id} />}
                </div>

                {/* Stack trace */}
                {payload && (
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Raw Payload</p>
                    <pre className="text-xs text-green-300 bg-gray-950 rounded p-3 overflow-x-auto max-h-64 overflow-y-auto">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unresolved: "bg-red-950 text-red-400",
    resolved: "bg-green-950 text-green-400",
    ignored: "bg-gray-800 text-gray-400",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
        colors[status] ?? colors.unresolved
      }`}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-gray-500">{k}: </span>
      <span className="text-gray-300 font-mono">{v}</span>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
