"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, Copy, Check } from "lucide-react";
import { getTransaction, type Transaction, type Span } from "@/lib/api";

interface Props {
  params: Promise<{ id: string; tid: string }>;
}

export default function TransactionDetailPage({ params }: Props) {
  const { id: projectId, tid } = use(params);
  const [txn, setTxn] = useState<(Transaction & { spans: Span[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Span | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getTransaction(projectId, tid)
      .then((r) => setTxn({ ...r.transaction, spans: r.spans ?? [] }))
      .finally(() => setLoading(false));
  }, [projectId, tid]);

  function copyTraceId() {
    if (!txn) return;
    navigator.clipboard.writeText(txn.trace_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="px-8 py-16 text-center">
        <p className="text-gray-500">Transaction not found</p>
        <Link href={`/projects/${projectId}/performance`} className="text-blue-400 text-sm mt-2 inline-block">
          Back to Performance
        </Link>
      </div>
    );
  }

  const totalMs = txn.duration_ms || 1;
  const txnStart = new Date(txn.started_at).getTime();

  // sort spans by start time
  const spans = [...(txn.spans ?? [])].sort(
    (a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()
  );

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}/performance`}
          className="text-gray-500 hover:text-gray-300 text-sm flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Performance
        </Link>
        <h2 className="text-lg font-bold text-white">{txn.name}</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
          <span className="text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded font-mono">{txn.op}</span>
          <StatusBadge status={txn.status} />
          <span>{Math.round(txn.duration_ms)}ms</span>
          {txn.environment && <span>{txn.environment}</span>}
          {txn.release && <span className="font-mono">{txn.release}</span>}
          <span>{new Date(txn.started_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Trace ID */}
      <div className="flex items-center gap-2 mb-6 text-xs text-gray-500">
        <span>Trace ID:</span>
        <code className="text-gray-400 font-mono">{txn.trace_id}</code>
        <button onClick={copyTraceId} className="hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Waterfall */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        {/* Header bar — the root transaction */}
        <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <div className="w-40 flex-shrink-0 truncate text-sm font-medium text-white">{txn.name}</div>
          <div className="flex-1 h-6 bg-gray-800 rounded relative overflow-hidden">
            <div
              className="h-full bg-blue-600/60 rounded"
              style={{ width: "100%" }}
            />
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] text-white font-mono">
              {formatDuration(txn.duration_ms)}
            </span>
          </div>
        </div>

        {/* Span rows */}
        {spans.length === 0 && (
          <div className="px-4 py-6 text-center text-gray-600 text-sm">No child spans recorded.</div>
        )}
        {spans.map((span) => {
          const spanStart = new Date(span.started_at).getTime();
          const offset = Math.max(0, spanStart - txnStart);
          const leftPct = (offset / totalMs) * 100;
          const widthPct = Math.max(0.5, (span.duration_ms / totalMs) * 100);
          const isSelected = selected?.span_id === span.span_id;

          return (
            <div key={span.span_id}>
              <button
                onClick={() => setSelected(isSelected ? null : span)}
                className={`w-full text-left border-b border-gray-800/50 px-4 py-2.5 flex items-center gap-3 hover:bg-gray-800/40 transition-colors ${
                  isSelected ? "bg-gray-800/60" : ""
                }`}
              >
                <div className="w-40 flex-shrink-0 truncate">
                  <span className={`text-[10px] px-1 py-0.5 rounded font-mono ${opColor(span.op)}`}>
                    {span.op}
                  </span>
                  {span.description && (
                    <span className="text-xs text-gray-400 ml-1.5 truncate">{span.description}</span>
                  )}
                </div>
                <div className="flex-1 h-5 bg-gray-800 rounded relative overflow-hidden">
                  <div
                    className={`absolute h-full rounded ${span.status === "error" ? "bg-red-600/60" : "bg-green-600/40"}`}
                    style={{ left: `${leftPct}%`, width: `${Math.min(widthPct, 100 - leftPct)}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-end pr-2 text-[10px] text-gray-400 font-mono">
                    {formatDuration(span.duration_ms)}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isSelected && (
                <div className="bg-gray-950 border-b border-gray-800 px-6 py-4 text-xs space-y-2">
                  <Row label="Span ID" value={span.span_id} mono />
                  {span.parent_span_id && <Row label="Parent Span" value={span.parent_span_id} mono />}
                  <Row label="Operation" value={span.op} />
                  {span.description && <Row label="Description" value={span.description} />}
                  <Row label="Status" value={span.status || "ok"} />
                  <Row label="Duration" value={`${span.duration_ms}ms`} />
                  <Row label="Started" value={new Date(span.started_at).toISOString()} />
                  {span.tags && Object.keys(span.tags).length > 0 && (
                    <div>
                      <span className="text-gray-500">Tags</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(span.tags).map(([k, v]) => (
                          <span key={k} className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                            {k}={String(v)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tags */}
      {txn.tags && Object.keys(txn.tags).length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(txn.tags).map(([k, v]) => (
              <span key={k} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-mono">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms >= 1) return `${Math.round(ms)}ms`;
  return `${(ms * 1000).toFixed(0)}µs`;
}

function opColor(op: string): string {
  const colors: Record<string, string> = {
    http: "text-blue-400 bg-blue-950",
    "http.server": "text-blue-400 bg-blue-950",
    "http.client": "text-cyan-400 bg-cyan-950",
    db: "text-yellow-400 bg-yellow-950",
    "db.sql": "text-yellow-400 bg-yellow-950",
    "db.redis": "text-red-400 bg-red-950",
    middleware: "text-gray-400 bg-gray-800",
    render: "text-green-400 bg-green-950",
  };
  return colors[op] ?? "text-gray-400 bg-gray-800";
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: "text-green-400 bg-green-950",
    error: "text-red-400 bg-red-950",
    cancelled: "text-gray-400 bg-gray-800",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${colors[status] ?? "text-gray-400 bg-gray-800"}`}>
      {status}
    </span>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className={`text-gray-300 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
