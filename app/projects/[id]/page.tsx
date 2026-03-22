"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Activity,
  Zap,
  FileText,
  BarChart2,
  ArrowRight,
  Copy,
  Check,
  Terminal,
  Code2,
  Bell,
  Lightbulb,
  Settings,
  BookOpen,
} from "lucide-react";
import {
  getProject,
  getProjectStats,
  listGroups,
  listTransactions,
  getTransactionStats,
  type Project,
  type ProjectStats,
  type ErrorGroup,
  type Transaction,
  type TransactionStats,
} from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectOverviewPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [groups, setGroups] = useState<ErrorGroup[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnStats, setTxnStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProject(projectId).catch(() => null),
      getProjectStats(projectId).catch(() => null),
      listGroups(projectId, {}).then((r) => r.groups).catch(() => []),
      listTransactions(projectId, { limit: 5 }).then((r) => r.transactions).catch(() => []),
      getTransactionStats(projectId).catch(() => null),
    ])
      .then(([proj, pStats, grps, txns, stats]) => {
        setProject(proj);
        setProjectStats(pStats);
        setGroups(grps.slice(0, 5));
        setTransactions(txns);
        setTxnStats(stats);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="text-center">
          <Activity className="w-5 h-5 text-green-500 animate-pulse mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading project...</p>
        </div>
      </div>
    );
  }

  const unresolvedCount = groups.filter((g) => g.status === "unresolved").length;
  const hasAnyData = (projectStats?.total_errors ?? 0) > 0 || (txnStats?.total ?? 0) > 0 || groups.length > 0 || transactions.length > 0;

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{project?.name ?? "Project"}</h2>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-gray-500">Overview</p>
          {project?.platform && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{project.platform}</span>
          )}
        </div>
      </div>

      {/* Getting started guide — shown when project has no data */}
      {!hasAnyData && project && <GettingStartedGuide project={project} projectId={projectId} />}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <OverviewCard
          icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
          label="Unresolved Issues"
          value={String(unresolvedCount)}
          href={`/projects/${projectId}/issues`}
        />
        <OverviewCard
          icon={<Zap className="w-4 h-4 text-blue-400" />}
          label="Transactions"
          value={txnStats ? String(txnStats.total) : "0"}
          href={`/projects/${projectId}/performance`}
        />
        <OverviewCard
          icon={<BarChart2 className="w-4 h-4 text-purple-400" />}
          label="Avg Duration"
          value={txnStats ? `${Math.round(txnStats.avg_duration_ms)}ms` : "—"}
          href={`/projects/${projectId}/performance`}
        />
        <OverviewCard
          icon={<FileText className="w-4 h-4 text-green-400" />}
          label="Error Rate"
          value={txnStats ? `${txnStats.error_rate.toFixed(1)}%` : "—"}
          href={`/projects/${projectId}/performance`}
        />
      </div>

      {/* What to explore next — shown when user has data */}
      {hasAnyData && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Explore your data:</strong> Check{" "}
            <Link href={`/projects/${projectId}/issues`} className="text-green-400 hover:underline">Issues</Link> for
            grouped errors,{" "}
            <Link href={`/projects/${projectId}/performance`} className="text-green-400 hover:underline">Performance</Link> for
            transaction traces,{" "}
            <Link href={`/projects/${projectId}/logs`} className="text-green-400 hover:underline">Logs</Link> for
            structured log streams, or set up{" "}
            <Link href={`/projects/${projectId}/alerts`} className="text-green-400 hover:underline">Alerts</Link> to
            get notified when things break.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent issues */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Recent Issues</h3>
            <Link href={`/projects/${projectId}/issues`} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {groups.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-lg p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No issues captured yet</p>
              <p className="text-xs text-gray-600">
                Errors will appear here once your SDK sends its first event
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  href={`/projects/${projectId}/issues/${g.id}`}
                  className="block bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${g.status === "resolved" ? "bg-green-500" : g.status === "ignored" ? "bg-gray-500" : "bg-red-500"}`} />
                    <span className="text-sm text-white truncate">{g.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{g.event_count} events</span>
                    <span>{g.level}</span>
                    <span>{new Date(g.last_seen).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-400">Recent Transactions</h3>
            <Link href={`/projects/${projectId}/performance`} className="text-xs text-blue-400 flex items-center gap-1 hover:underline">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {transactions.length === 0 ? (
            <div className="bg-gray-900/40 border border-gray-800 border-dashed rounded-lg p-6 text-center">
              <Zap className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No transactions recorded yet</p>
              <p className="text-xs text-gray-600">
                Use <code className="text-green-400/80">observe.startTransaction()</code> in your SDK to trace operations
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <Link
                  key={t.id}
                  href={`/projects/${projectId}/performance/${t.id}`}
                  className="block bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{t.name}</span>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                      t.duration_ms > 3000 ? "text-red-400 bg-red-950" :
                      t.duration_ms > 1000 ? "text-yellow-400 bg-yellow-950" :
                      "text-green-400 bg-green-950"
                    }`}>
                      {t.duration_ms >= 1000 ? `${(t.duration_ms / 1000).toFixed(1)}s` : `${Math.round(t.duration_ms)}ms`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-mono">{t.op}</span>
                    <span className={t.status === "ok" ? "text-green-500" : "text-red-400"}>{t.status}</span>
                    <span>{new Date(t.received_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Getting Started Guide ──────────────────────────────────────────────────── */

function GettingStartedGuide({ project, projectId }: { project: Project; projectId: string }) {
  const [copied, setCopied] = useState(false);

  function copyDSN() {
    navigator.clipboard.writeText(project.dsn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="bg-gradient-to-br from-green-950/30 to-blue-950/20 border border-green-900/30 rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Get started with {project.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Follow these steps to start capturing errors and traces</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Step 1: DSN */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">1</span>
              <p className="text-sm font-medium text-white">Copy your DSN key</p>
            </div>
            <p className="text-xs text-gray-400 mb-3">This key authenticates your app with Observe. Keep it secret.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-xs text-green-400 font-mono truncate select-all">
                {project.dsn}
              </code>
              <button
                onClick={copyDSN}
                className="flex items-center gap-1 text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors flex-shrink-0"
              >
                {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>

          {/* Step 2: Install SDK */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">2</span>
              <p className="text-sm font-medium text-white">Install the SDK and initialise</p>
            </div>
            <pre className="text-xs bg-gray-950 border border-gray-700 rounded p-3 text-green-400 overflow-x-auto font-mono">
{`import { ObserveClient } from "@africoders/observe";

const observe = new ObserveClient({
  dsn: "${project.dsn}",
  environment: "production",
  tracesSampleRate: 0.2,
});

observe.installGlobalHandlers();`}
            </pre>
          </div>

          {/* Step 3: Verify */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">3</span>
              <p className="text-sm font-medium text-white">Send a test event</p>
            </div>
            <p className="text-xs text-gray-400 mb-2">Trigger a test error to verify your setup is working:</p>
            <pre className="text-xs bg-gray-950 border border-gray-700 rounded p-3 text-green-400 overflow-x-auto font-mono">
{`observe.captureException(new Error("Hello from Observe!"));`}
            </pre>
            <p className="text-xs text-gray-500 mt-2">
              Once sent, the error will appear in the <Link href={`/projects/${projectId}/issues`} className="text-green-400 hover:underline">Issues</Link> tab within seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Quick navigation hints */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickLink icon={<AlertTriangle className="w-4 h-4" />} label="Issues" desc="Grouped errors" href={`/projects/${projectId}/issues`} color="red" />
        <QuickLink icon={<Zap className="w-4 h-4" />} label="Performance" desc="Transaction traces" href={`/projects/${projectId}/performance`} color="blue" />
        <QuickLink icon={<Bell className="w-4 h-4" />} label="Alerts" desc="Set up notifications" href={`/projects/${projectId}/alerts`} color="amber" />
        <QuickLink icon={<Settings className="w-4 h-4" />} label="Settings" desc="DSN & config" href={`/projects/${projectId}/settings`} color="gray" />
      </div>
    </div>
  );
}

function QuickLink({ icon, label, desc, href, color }: { icon: React.ReactNode; label: string; desc: string; href: string; color: string }) {
  const colorMap: Record<string, string> = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    gray: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };
  const c = colorMap[color] ?? colorMap.gray;
  return (
    <Link href={href} className="bg-gray-900/60 border border-gray-800 rounded-lg p-3 hover:border-gray-700 transition-colors text-center group">
      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center mx-auto mb-2 ${c} group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-xs font-medium text-white">{label}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
    </Link>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-700 transition-colors"
    >
      {icon}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </Link>
  );
}
