"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, Check, Lightbulb } from "lucide-react";
import { createProject } from "@/lib/api";
import { useCan } from "@/lib/useObserveRole";

/* ── Platform catalogue ─────────────────────────────────────────────────────── */

interface Platform {
  value: string;
  label: string;
  categories: string[];
}

const PLATFORMS: Platform[] = [
  // Browser
  { value: "javascript",     label: "JavaScript",      categories: ["popular", "browser"] },
  { value: "react",          label: "React",            categories: ["popular", "browser"] },
  { value: "nextjs",         label: "Next.js",          categories: ["popular", "browser", "server"] },
  { value: "angular",        label: "Angular",          categories: ["popular", "browser"] },
  { value: "vue",            label: "Vue",              categories: ["browser"] },
  { value: "svelte",         label: "Svelte",           categories: ["browser"] },
  { value: "sveltekit",      label: "SvelteKit",        categories: ["browser", "server"] },
  { value: "ember",          label: "Ember",            categories: ["browser"] },
  { value: "solid",          label: "SolidJS",          categories: ["browser"] },
  { value: "remix",          label: "Remix",            categories: ["browser", "server"] },
  { value: "nuxt",           label: "Nuxt",             categories: ["browser", "server"] },
  { value: "astro",          label: "Astro",            categories: ["browser", "server"] },
  { value: "gatsby",         label: "Gatsby",           categories: ["browser"] },
  { value: "htmx",           label: "HTMX",             categories: ["browser"] },

  // Server — Node / JS
  { value: "node",           label: "Node.js",          categories: ["popular", "server"] },
  { value: "express",        label: "Express",          categories: ["popular", "server"] },
  { value: "fastify",        label: "Fastify",          categories: ["server"] },
  { value: "nestjs",         label: "NestJS",           categories: ["server"] },
  { value: "koa",            label: "Koa",              categories: ["server"] },
  { value: "hono",           label: "Hono",             categories: ["server"] },
  { value: "deno",           label: "Deno",             categories: ["server"] },
  { value: "bun",            label: "Bun",              categories: ["server"] },

  // Server — Python
  { value: "python",         label: "Python",           categories: ["popular", "server"] },
  { value: "django",         label: "Django",           categories: ["popular", "server"] },
  { value: "flask",          label: "Flask",            categories: ["popular", "server"] },
  { value: "fastapi",        label: "FastAPI",          categories: ["server"] },
  { value: "celery",         label: "Celery",           categories: ["server"] },
  { value: "tornado",        label: "Tornado",          categories: ["server"] },
  { value: "starlette",      label: "Starlette",        categories: ["server"] },

  // Server — Go
  { value: "go",             label: "Go",               categories: ["popular", "server"] },
  { value: "fiber",          label: "Go Fiber",         categories: ["server"] },
  { value: "gin",            label: "Gin",              categories: ["server"] },
  { value: "echo",           label: "Echo",             categories: ["server"] },

  // Server — Ruby
  { value: "ruby",           label: "Ruby",             categories: ["popular", "server"] },
  { value: "rails",          label: "Rails",            categories: ["popular", "server"] },
  { value: "sinatra",        label: "Sinatra",          categories: ["server"] },

  // Server — PHP
  { value: "php",            label: "PHP",              categories: ["popular", "server"] },
  { value: "laravel",        label: "Laravel",          categories: ["popular", "server"] },
  { value: "symfony",        label: "Symfony",          categories: ["popular", "server"] },
  { value: "wordpress",      label: "WordPress",        categories: ["server"] },

  // Server — JVM
  { value: "java",           label: "Java",             categories: ["popular", "server"] },
  { value: "spring-boot",    label: "Spring Boot",      categories: ["server"] },
  { value: "kotlin",         label: "Kotlin",           categories: ["server", "mobile"] },
  { value: "scala",          label: "Scala",            categories: ["server"] },

  // Server — .NET
  { value: "csharp",         label: "C#",               categories: ["popular", "server"] },
  { value: "dotnet",         label: ".NET",             categories: ["server"] },
  { value: "aspnet",         label: "ASP.NET",          categories: ["server"] },

  // Server — Other
  { value: "rust",           label: "Rust",             categories: ["server"] },
  { value: "elixir",         label: "Elixir",           categories: ["popular", "server"] },
  { value: "phoenix",        label: "Phoenix",          categories: ["server"] },
  { value: "erlang",         label: "Erlang",           categories: ["server"] },
  { value: "clojure",        label: "Clojure",          categories: ["server"] },
  { value: "haskell",        label: "Haskell",          categories: ["server"] },
  { value: "perl",           label: "Perl",             categories: ["server"] },
  { value: "r",              label: "R",                categories: ["server"] },
  { value: "lua",            label: "Lua",              categories: ["server"] },
  { value: "zig",            label: "Zig",              categories: ["server"] },
  { value: "c",              label: "C / C++",          categories: ["server", "desktop"] },
  { value: "swift-server",   label: "Swift (Server)",   categories: ["server"] },
  { value: "dart",           label: "Dart",             categories: ["server"] },
  { value: "cloudflare-workers", label: "Cloudflare Workers", categories: ["server"] },
  { value: "aws-lambda",     label: "AWS Lambda",       categories: ["server"] },
  { value: "vercel",         label: "Vercel",           categories: ["server"] },

  // Mobile
  { value: "react-native",   label: "React Native",     categories: ["popular", "mobile"] },
  { value: "flutter",        label: "Flutter",          categories: ["popular", "mobile"] },
  { value: "swift",          label: "Swift / iOS",      categories: ["mobile"] },
  { value: "android",        label: "Android",          categories: ["mobile"] },
  { value: "ionic",          label: "Ionic",            categories: ["mobile"] },
  { value: "capacitor",      label: "Capacitor",        categories: ["mobile"] },
  { value: "expo",           label: "Expo",             categories: ["mobile"] },
  { value: "maui",           label: ".NET MAUI",        categories: ["mobile"] },
  { value: "xamarin",        label: "Xamarin",          categories: ["mobile"] },
  { value: "cordova",        label: "Cordova",          categories: ["mobile"] },

  // Desktop
  { value: "electron",       label: "Electron",         categories: ["desktop"] },
  { value: "tauri",          label: "Tauri",            categories: ["desktop"] },
  { value: "qt",             label: "Qt",               categories: ["desktop"] },
  { value: "wpf",            label: "WPF",              categories: ["desktop"] },
  { value: "winforms",       label: "WinForms",         categories: ["desktop"] },
  { value: "swiftui",        label: "SwiftUI (macOS)",  categories: ["desktop"] },
  { value: "gtk",            label: "GTK",              categories: ["desktop"] },

  // Catch-all
  { value: "other",          label: "Other",            categories: ["popular"] },
];

const TABS = [
  { key: "popular", label: "Popular" },
  { key: "browser", label: "Browser" },
  { key: "server",  label: "Server" },
  { key: "mobile",  label: "Mobile" },
  { key: "desktop", label: "Desktop" },
  { key: "all",     label: "All" },
] as const;

/* ── Page ───────────────────────────────────────────────────────────────────── */

export default function NewProjectPage() {
  const router = useRouter();
  const canManage = useCan("manageProjects");
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [tab, setTab] = useState<string>("popular");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const lc = filter.toLowerCase();
    return PLATFORMS.filter((p) => {
      const matchesTab = tab === "all" || p.categories.includes(tab);
      const matchesFilter = !lc || p.label.toLowerCase().includes(lc) || p.value.toLowerCase().includes(lc);
      return matchesTab && matchesFilter;
    });
  }, [tab, filter]);

  useEffect(() => {
    if (!canManage) router.replace("/");
  }, [canManage, router]);

  if (!canManage) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !platform) return;
    setLoading(true);
    setError(null);
    try {
      const project = await createProject({ name: name.trim(), platform });
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  const selectedLabel = PLATFORMS.find((p) => p.value === platform)?.label;

  return (
      <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">Create Project</h1>
        <p className="text-gray-400 text-sm mb-6">
          A project maps to an application or service you want to monitor.
        </p>

        {/* What happens next info box */}
        <div className="bg-blue-950/30 border border-blue-900/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-200">What happens after you create a project?</strong>
            <ol className="mt-1.5 space-y-1 list-decimal list-inside text-gray-400">
              <li>You&apos;ll get a unique <strong className="text-green-400">DSN key</strong> to connect your app</li>
              <li>Install the Observe SDK in your codebase (3 lines of code)</li>
              <li>Errors, traces, and logs start flowing to your dashboard automatically</li>
            </ol>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Platform
            </label>
            <p className="text-xs text-gray-500 mb-3">
              The primary platform for this project. Used for documentation and SDK setup.
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter platforms…"
                className="w-full bg-gray-900 border border-gray-700 text-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-600"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-0.5 border-b border-gray-800 mb-3">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    tab === t.key
                      ? "border-green-500 text-green-400"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Platform grid */}
            <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-800 bg-gray-900 p-2">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  No platforms match &quot;{filter}&quot;
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {filtered.map((p) => {
                    const selected = platform === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPlatform(p.value)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border transition-colors ${
                          selected
                            ? "bg-green-950 border-green-700 text-green-300"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white"
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selection feedback */}
            {platform && (
              <p className="text-xs text-gray-500 mt-2">
                Selected: <span className="text-green-400 font-medium">{selectedLabel}</span>
              </p>
            )}
          </div>

          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Academy Frontend"
              required
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 placeholder-gray-600"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim() || !platform}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-green-600/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Project
          </button>
        </form>

        {/* What you get section */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <h3 className="text-sm font-medium text-gray-400 mb-4">What each project includes</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Error Tracking", desc: "Capture and group exceptions with full stack traces" },
              { label: "Performance", desc: "Trace transactions with span-level waterfalls" },
              { label: "Logs", desc: "Structured log aggregation with search and filtering" },
              { label: "Metrics", desc: "Custom counters, gauges, and distributions" },
              { label: "Alerts", desc: "Threshold-based rules with webhook notifications" },
              { label: "Releases", desc: "Track which deployments introduced regressions" },
            ].map(({ label, desc }) => (
              <div key={label} className="bg-gray-900/40 border border-gray-800 rounded-lg p-3">
                <p className="text-xs font-medium text-white">{label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
  );
}
