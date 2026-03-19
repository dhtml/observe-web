"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Activity, ExternalLink, LogIn } from "lucide-react";
import { ObserveShell } from "@/app/observe-shell";
import { listProjects, getProjectStats, type Project } from "@/lib/api";
import { useCan } from "@/lib/useObserveRole";
import { useAuth } from "@shared/hooks/useAuth";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canManage = useCan("manageProjects");
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    listProjects()
      .then((r) => setProjects(r.projects))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  // Guest landing
  if (!authLoading && !isAuthenticated) {
    return (
      <ObserveShell>
        <div className="flex flex-col items-center justify-center py-32 px-8 text-center">
          <Activity className="w-16 h-16 text-cyan-500 mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Africoders Observe</h1>
          <p className="text-gray-400 max-w-md mb-8">
            Self-hosted observability for the Africoders ecosystem — errors, logs, metrics, and alerts in one place.
          </p>
          <p className="text-gray-500 text-sm flex items-center gap-2">
            <LogIn className="w-4 h-4" />
            Sign in to view your projects
          </p>
        </div>
      </ObserveShell>
    );
  }

  return (
    <ObserveShell>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-gray-400 text-sm mt-1">Monitor your applications</p>
          </div>
          {canManage && (
            <Link
              href="/projects/new"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Activity className="w-6 h-6 text-gray-500 animate-pulse" />
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20">
            <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-400">No projects yet.</p>
            {canManage && (
              <Link
                href="/projects/new"
                className="mt-4 inline-block text-green-400 hover:text-green-300 text-sm"
              >
                Create your first project →
              </Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </div>
    </ObserveShell>
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

  return (
    <Link
      href={`/projects/${project.id}/issues`}
      className="block bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{project.platform}</p>
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
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
    </Link>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <div>
      <p className={`text-lg font-bold ${warn && value > 0 ? "text-red-400" : "text-gray-300"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
