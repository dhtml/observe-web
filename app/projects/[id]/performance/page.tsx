"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { Activity, Timer, TrendingUp, AlertTriangle, Zap, Clock } from "lucide-react";
import {
  listTransactions,
  getTransactionStats,
  type Transaction,
  type TransactionStats,
} from "@/lib/api";

const OP_COLORS: Record<string, string> = {
  http: "text-blue-400 bg-blue-950",
  "http.server": "text-blue-400 bg-blue-950",
  "http.client": "text-cyan-400 bg-cyan-950",
  db: "text-yellow-400 bg-yellow-950",
  "db.sql": "text-yellow-400 bg-yellow-950",
  "db.redis": "text-red-400 bg-red-950",
  graphql: "text-pink-400 bg-pink-950",
  grpc: "text-purple-400 bg-purple-950",
  queue: "text-orange-400 bg-orange-950",
  middleware: "text-gray-400 bg-gray-800",
  default: "text-gray-400 bg-gray-800",
};

const STATUS_COLORS: Record<string, string> = {
  ok: "text-green-400",
  error: "text-red-400",
  cancelled: "text-gray-400",
  deadline_exceeded: "text-yellow-400",
  not_found: "text-orange-400",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default function PerformancePage({ params }: Props) {
  const { id: projectId } = use(params);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [op, setOp] = useState("");
  const [env, setEnv] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      listTransactions(projectId, { op: op || undefined, environment: env || undefined, limit: 50 }),
      getTransactionStats(projectId),
    ])
      .then(([txnRes, statsRes]) => {
        setTransactions(txnRes.transactions);
        setTotal(txnRes.total);
        setStats(statsRes);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, op, env]);

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Performance</h2>
        <p className="text-sm text-gray-500 mt-0.5">Transaction traces and latency</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard icon={<Zap className="w-4 h-4 text-blue-400" />} label="Total" value={String(stats.total)} />
          <StatCard icon={<Timer className="w-4 h-4 text-yellow-400" />} label="Avg Duration" value={`${Math.round(stats.avg_duration_ms)}ms`} />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-purple-400" />} label="P95" value={`${Math.round(stats.p95_duration_ms)}ms`} />
          <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-400" />} label="Error Rate" value={`${stats.error_rate.toFixed(1)}%`} />
          <StatCard icon={<Clock className="w-4 h-4 text-green-400" />} label="Last 24h" value={String(stats.last_24h)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={op}
          onChange={(e) => setOp(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1.5 focus:outline-none"
        >
          <option value="">All Operations</option>
          <option value="http">HTTP</option>
          <option value="http.server">HTTP Server</option>
          <option value="http.client">HTTP Client</option>
          <option value="db">Database</option>
          <option value="db.sql">SQL</option>
          <option value="queue">Queue</option>
          <option value="graphql">GraphQL</option>
          <option value="grpc">gRPC</option>
        </select>

        <select
          value={env}
          onChange={(e) => setEnv(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-md px-2 py-1.5 focus:outline-none"
        >
          <option value="">All Environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
          <option value="local">Local</option>
        </select>

        <span className="text-xs text-gray-500">{total} transactions</span>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
        </div>
      )}

      {!loading && transactions.length === 0 && (
        <div className="text-center py-16">
          <Zap className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No transactions recorded yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Use <code className="text-green-400">observe.startTransaction()</code> in your SDK to start capturing.
          </p>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-2">
        {transactions.map((t) => (
          <Link
            key={t.id}
            href={`/projects/${projectId}/performance/${t.id}`}
            className="block bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
                      OP_COLORS[t.op] ?? OP_COLORS.default
                    }`}
                  >
                    {t.op}
                  </span>
                  <span className="font-medium text-white text-sm truncate max-w-lg">
                    {t.name}
                  </span>
                  {t.description && (
                    <span className="text-xs text-gray-500 truncate">{t.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={STATUS_COLORS[t.status] ?? "text-gray-400"}>{t.status}</span>
                  <span>{t.environment}</span>
                  {t.release && <span className="font-mono">{t.release}</span>}
                  <span>{new Date(t.received_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <DurationBadge ms={t.duration_ms} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function DurationBadge({ ms }: { ms: number }) {
  let color = "text-green-400 bg-green-950";
  if (ms > 3000) color = "text-red-400 bg-red-950";
  else if (ms > 1000) color = "text-yellow-400 bg-yellow-950";
  else if (ms > 500) color = "text-orange-400 bg-orange-950";

  const display = ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  return (
    <span className={`text-xs px-2 py-1 rounded font-mono font-medium ${color}`}>
      {display}
    </span>
  );
}
