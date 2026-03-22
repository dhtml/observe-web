"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Zap,
  Code2,
  Terminal,
  Layers,
  Search,
  Bell,
  GitBranch,
  ArrowRight,
  Globe,
  CheckCircle2,
  Gauge,
  Bug,
  FileText,
  Users,
  Lock,
  Plus,
  ExternalLink,
  LogIn,
  Lightbulb,
  Rocket,
  Settings,
  Copy,
  BookOpen,
  Shield,
  BarChart2,
  Eye,
} from "lucide-react";
import { useAuth } from "@shared/hooks/useAuth";
import { getUrl } from "@shared/utils/domains";
import { listProjects, getProjectStats, type Project } from "@/lib/api";
import { useCan } from "@/lib/useObserveRole";

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Activity className="w-8 h-8 text-green-500 animate-pulse mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading Observe...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <ProjectsDashboard /> : <GuestLanding />;
}

/* ── Projects dashboard (authenticated) ─────────────────────────────────────── */

function ProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedTips, setDismissedTips] = useState(false);
  const canManage = useCan("manageProjects");

  useEffect(() => {
    listProjects()
      .then((r) => setProjects(r.projects))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 text-sm mt-1">Monitor errors, performance, and logs across your applications</p>
        </div>
        {canManage && (
          <Link
            href="/projects/new"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-green-600/20"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="text-center">
            <Activity className="w-6 h-6 text-green-500 animate-pulse mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading projects...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm flex items-start gap-3">
          <Bug className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Failed to load projects</p>
            <p className="text-red-400 text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Empty state — onboarding wizard */}
      {!loading && !error && projects.length === 0 && (
        <div className="mt-4">
          {/* Welcome hero */}
          <div className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-green-950/20 p-8 sm:p-10 mb-8 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-4">
                <Rocket className="w-3.5 h-3.5" />
                Get started in 3 minutes
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Welcome to Observe</h2>
              <p className="text-gray-400 max-w-xl leading-relaxed">
                Track errors, monitor performance, and search logs — all in one place.
                Create your first project to get a DSN key, then drop in the SDK and start capturing events.
              </p>
              {canManage && (
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-2 mt-6 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-green-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </Link>
              )}
            </div>
          </div>

          {/* How it works steps */}
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StepCard
              step={1}
              icon={<Layers className="w-5 h-5" />}
              title="Create a project"
              desc="Pick your platform (React, Node.js, Python, Go, etc.) — you'll get a unique DSN key that authenticates your app."
              color="green"
            />
            <StepCard
              step={2}
              icon={<Code2 className="w-5 h-5" />}
              title="Install the SDK"
              desc="Add 3 lines of code. The SDK auto-captures unhandled errors, traces HTTP requests, and records user breadcrumbs."
              color="blue"
            />
            <StepCard
              step={3}
              icon={<Eye className="w-5 h-5" />}
              title="See everything"
              desc="Stack traces, span waterfalls, log streams, custom metrics, and real-time alerts — all in your project dashboard."
              color="purple"
            />
          </div>

          {/* Feature highlights */}
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">What you can do</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MiniFeature icon={<Bug className="w-4 h-4" />} color="red" title="Error Tracking" desc="Full stack traces, breadcrumbs, AI grouping" />
            <MiniFeature icon={<Zap className="w-4 h-4" />} color="blue" title="Performance" desc="Transaction traces with span waterfalls" />
            <MiniFeature icon={<FileText className="w-4 h-4" />} color="purple" title="Structured Logs" desc="Filtered log streams with trace correlation" />
            <MiniFeature icon={<Bell className="w-4 h-4" />} color="amber" title="Real-Time Alerts" desc="Threshold rules with webhook notifications" />
            <MiniFeature icon={<BarChart2 className="w-4 h-4" />} color="green" title="Custom Metrics" desc="Counters, gauges, and distributions" />
            <MiniFeature icon={<GitBranch className="w-4 h-4" />} color="cyan" title="Release Tracking" desc="Compare error rates across deployments" />
          </div>
        </div>
      )}

      {/* Projects grid with optional tips */}
      {!loading && !error && projects.length > 0 && (
        <>
          {/* Quick tips banner */}
          {!dismissedTips && (
            <div className="mb-6 bg-gradient-to-r from-green-950/40 to-blue-950/40 border border-green-900/40 rounded-xl p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 font-medium">Quick tips</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Click any project to see its overview dashboard. Go to <strong className="text-gray-300">Settings</strong> to
                  copy your DSN key. Use the tabs (Issues, Logs, Performance, Metrics, Alerts, Releases)
                  to explore each aspect of your project.
                </p>
              </div>
              <button
                onClick={() => setDismissedTips(true)}
                className="text-gray-600 hover:text-gray-400 text-xs flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StepCard({ step, icon, title, desc, color }: { step: number; icon: React.ReactNode; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    green: "bg-green-500/10 border-green-500/20 text-green-400",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400",
  };
  const c = colors[color] ?? colors.green;
  return (
    <div className="relative bg-gray-900/60 border border-gray-800 rounded-xl p-5 sm:p-6 hover:border-gray-700 transition-colors">
      <span className="absolute top-4 right-5 text-4xl font-bold text-gray-800/50">{String(step).padStart(2, "0")}</span>
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${c} mb-4`}>
        {icon}
      </div>
      <h4 className="font-semibold text-white mb-1.5">{title}</h4>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function MiniFeature({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  const colorMap: Record<string, string> = {
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    green: "text-green-400 bg-green-500/10 border-green-500/20",
    cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  };
  const c = colorMap[color] ?? colorMap.green;
  return (
    <div className="flex items-start gap-3 bg-gray-900/60 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${c}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [stats, setStats] = useState<{
    total_errors: number;
    unresolved_groups: number;
    errors_last_24h: number;
  } | null>(null);

  useEffect(() => {
    getProjectStats(project.id).then(setStats).catch(() => null);
  }, [project.id]);

  const hasData = stats && (stats.total_errors > 0 || stats.unresolved_groups > 0);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-black/20 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{project.platform}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
      </div>

      {stats ? (
        <div className="grid grid-cols-3 gap-2 text-center mt-4">
          <Stat label="Errors 24h" value={stats.errors_last_24h} warn={stats.errors_last_24h > 0} />
          <Stat label="Unresolved" value={stats.unresolved_groups} warn={stats.unresolved_groups > 0} />
          <Stat label="Total" value={stats.total_errors} />
        </div>
      ) : (
        <div className="h-8 mt-4" />
      )}

      {stats && !hasData && (
        <p className="text-[10px] text-gray-600 mt-3 text-center">No events yet — install the SDK to start capturing</p>
      )}
    </Link>
  );
}

function Stat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div>
      <p className={`text-lg font-bold ${warn && value > 0 ? "text-red-400" : "text-gray-300"}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

/* ── Guest landing page ─────────────────────────────────────────────────────── */

function GuestLanding() {
  const loginUrl = `${getUrl("identity")}/login?redirect_url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

  return (
    <div className="text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-950" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6 sm:mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Open-source &amp; self-hosted
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-4 sm:mb-6">
              Error tracking &amp;{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                performance monitoring
              </span>{" "}
              for developers
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4">
              Capture every error with full stack traces, trace transactions end-to-end,
              monitor latency percentiles, and get alerted in real time.
              All self-hosted, all open-source.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <a
                href={loginUrl}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-all hover:shadow-xl hover:shadow-green-600/20 text-sm sm:text-base"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#features"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg border border-gray-700 hover:border-gray-600 text-gray-300 font-medium transition-all text-sm sm:text-base"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* Terminal preview */}
          <div className="mt-12 sm:mt-16 max-w-2xl mx-auto">
            <div className="rounded-xl border border-gray-800 bg-gray-900/80 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-2 text-xs text-gray-500 font-mono">~/my-app</span>
              </div>
              <div className="p-4 sm:p-5 font-mono text-xs sm:text-sm space-y-2 overflow-x-auto">
                <p><span className="text-gray-500">$</span> <span className="text-green-400">npm install</span> <span className="text-yellow-300">@africoders/observe</span></p>
                <p className="text-gray-600 mt-3">{"// app.ts"}</p>
                <p><span className="text-purple-400">import</span> <span className="text-gray-300">{"{ ObserveClient }"}</span> <span className="text-purple-400">from</span> <span className="text-yellow-300">{'"@africoders/observe"'}</span></p>
                <p className="mt-2"><span className="text-purple-400">const</span> <span className="text-blue-300">observe</span> <span className="text-gray-500">=</span> <span className="text-purple-400">new</span> <span className="text-green-300">ObserveClient</span>{"({"}</p>
                <p className="pl-4"><span className="text-blue-300">dsn</span>: <span className="text-yellow-300">{'"obs_your_project_dsn_here"'}</span>,</p>
                <p className="pl-4"><span className="text-blue-300">environment</span>: <span className="text-yellow-300">{'"production"'}</span>,</p>
                <p className="pl-4"><span className="text-blue-300">tracesSampleRate</span>: <span className="text-orange-300">0.2</span>,</p>
                <p>{"})"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-800/60 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: "50+", label: "Platforms supported" },
              { value: "<5ms", label: "SDK overhead" },
              { value: "100%", label: "Self-hosted" },
              { value: "∞", label: "Events — no limits" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Everything you need to ship with confidence</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">From error capture to performance insights — complete observability in one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <FeatureCard icon={<Bug className="w-5 h-5" />} color="red" title="Error Tracking" desc="Automatic error capture with full stack traces, breadcrumbs, and user context. Errors are grouped intelligently with AI-powered summaries." />
            <FeatureCard icon={<Zap className="w-5 h-5" />} color="blue" title="Performance Monitoring" desc="Trace transactions end-to-end with span waterfalls. See P95 latency, throughput, and slowest operations at a glance." />
            <FeatureCard icon={<FileText className="w-5 h-5" />} color="purple" title="Structured Logging" desc="Centralised log aggregation with level filtering, service tagging, full-text search, and trace correlation." />
            <FeatureCard icon={<Gauge className="w-5 h-5" />} color="amber" title="Metrics & Dashboards" desc="Track custom metrics — counters, gauges, distributions. Monitor system health and business KPIs over time." />
            <FeatureCard icon={<Bell className="w-5 h-5" />} color="green" title="Real-Time Alerts" desc="Set threshold-based alert rules per project. Get notified via webhooks, email, or Slack when something breaks." />
            <FeatureCard icon={<GitBranch className="w-5 h-5" />} color="cyan" title="Release Tracking" desc="Automatically track which releases introduced regressions. Compare error rates and performance across deployments." />
          </div>
        </div>
      </section>

      {/* SDK section */}
      <section id="sdk" className="py-16 sm:py-24 bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Works with every stack</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">Drop-in SDKs for all major platforms. Set up in under 5 minutes.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-10 sm:mb-12">
            {[
              { name: "JavaScript", icon: <Code2 className="w-5 h-5" /> },
              { name: "React", icon: <Layers className="w-5 h-5" /> },
              { name: "Next.js", icon: <Globe className="w-5 h-5" /> },
              { name: "Node.js", icon: <Terminal className="w-5 h-5" /> },
              { name: "Python", icon: <Code2 className="w-5 h-5" /> },
              { name: "Go", icon: <Code2 className="w-5 h-5" /> },
              { name: "Django", icon: <Layers className="w-5 h-5" /> },
              { name: "Flask", icon: <Code2 className="w-5 h-5" /> },
              { name: "Rails", icon: <Layers className="w-5 h-5" /> },
              { name: "Laravel", icon: <Code2 className="w-5 h-5" /> },
              { name: "Java", icon: <Code2 className="w-5 h-5" /> },
              { name: "50+ more", icon: <ArrowRight className="w-5 h-5" /> },
            ].map(({ name, icon }) => (
              <div key={name} className="flex flex-col items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/60 p-3 sm:p-4 hover:border-gray-700 transition-colors">
                <div className="text-gray-400">{icon}</div>
                <span className="text-xs sm:text-sm text-gray-300 font-medium">{name}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: <Search className="w-4 h-4" />, label: "Auto-capture errors", desc: "Global error handlers catch every unhandled exception" },
              { icon: <Zap className="w-4 h-4" />, label: "Transaction tracing", desc: "Trace HTTP requests, DB queries, and custom operations" },
              { icon: <Layers className="w-4 h-4" />, label: "Breadcrumbs", desc: "Automatic trail of UI clicks, navigation, and API calls" },
              { icon: <Users className="w-4 h-4" />, label: "User context", desc: "Attach user ID, email, and session data to every event" },
              { icon: <Code2 className="w-4 h-4" />, label: "Envelope batching", desc: "Efficient batch transport — multiple events in one request" },
              { icon: <Lock className="w-4 h-4" />, label: "DSN authentication", desc: "Scoped per-project keys with built-in rate limiting" },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Up and running in 3 steps</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base">No agents to install, no infra to manage.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: "01", title: "Create a project", desc: "Choose your platform from 50+ options. You get a unique DSN key to connect your app.", icon: <Layers className="w-6 h-6" /> },
              { step: "02", title: "Install the SDK", desc: "Add 3 lines of code. The SDK auto-captures errors, traces performance, and records breadcrumbs.", icon: <Terminal className="w-6 h-6" /> },
              { step: "03", title: "See everything", desc: "Stack traces, span waterfalls, log streams, and metrics — all in one real-time dashboard.", icon: <Activity className="w-6 h-6" /> },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="relative">
                <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 sm:p-8 h-full hover:border-gray-700 transition-colors">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-800/60 absolute top-4 right-6">{step}</span>
                  <div className="w-11 h-11 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 mb-5">{icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Observe */}
      <section className="py-16 sm:py-24 bg-gray-900/30 border-y border-gray-800/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Why Observe?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
            {[
              { text: "Self-hosted — your data stays on your servers" },
              { text: "No event limits or per-seat pricing" },
              { text: "AI-powered error grouping and summaries" },
              { text: "Built-in rate limiting and DSN scoping" },
              { text: "Transaction tracing with span waterfalls" },
              { text: "Multi-language SDK support" },
              { text: "Real-time alerting with custom thresholds" },
              { text: "Part of the Africoders ecosystem" },
            ].map(({ text }) => (
              <div key={text} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-gray-900/60 border border-gray-800">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Start monitoring in minutes</h2>
            <p className="text-gray-400 mb-8 sm:mb-10 text-sm sm:text-base">Create a free account, install the SDK, and see your first error within 5 minutes. No credit card required.</p>
            <a
              href={loginUrl}
              className="inline-flex items-center gap-2 px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold text-base sm:text-lg transition-all hover:shadow-xl hover:shadow-green-600/20"
            >
              <LogIn className="w-5 h-5" /> Get Started Free
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Feature card ───────────────────────────────────────────────────────────── */

const colorMap: Record<string, { icon: string; bg: string; border: string }> = {
  red:    { icon: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20" },
  blue:   { icon: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  purple: { icon: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  amber:  { icon: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  green:  { icon: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  cyan:   { icon: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
};

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  const c = colorMap[color] ?? colorMap.green;
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 sm:p-6 hover:border-gray-700 transition-colors group">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${c.bg} ${c.border} mb-4 group-hover:scale-110 transition-transform`}>
        <div className={c.icon}>{icon}</div>
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}
