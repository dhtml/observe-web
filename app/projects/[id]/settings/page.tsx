"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Copy, Check, Trash2, Activity } from "lucide-react";
import { getProject, updateProject, deleteProject, type Project } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useObserveRole, useCan } from "@/lib/useObserveRole";
import { Lock } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function SettingsPage({ params }: Props) {
  const { id: projectId } = use(params);
  const router = useRouter();
  const role = useObserveRole();
  const canManage = useCan("manageProjects");
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getProject(projectId)
      .then((p) => {
        setProject(p);
        setName(p.name);
        setPlatform(p.platform);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProject(projectId, { name, platform });
      setProject(updated);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete project "${project?.name}"? This is irreversible.`)) return;
    setDeleting(true);
    try {
      await deleteProject(projectId);
      router.push("/projects");
    } finally {
      setDeleting(false);
    }
  }

  function copyDSN() {
    if (project?.dsn) {
      navigator.clipboard.writeText(project.dsn);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
      </div>
    );
  }

  if (!project) return <p className="px-8 py-8 text-gray-400">Project not found</p>;

  return (
    <div className="px-8 py-8 max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Settings</h2>
        <p className="text-sm text-gray-500">Manage your project configuration</p>
      </div>

      {/* Role banner */}
      {!canManage && (
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-400">
          <Lock className="w-4 h-4 flex-shrink-0" />
          {role === "moderator"
            ? "You have moderator access — project settings are read-only."
            : "You have read-only access. Log in with an admin account to manage this project."}
        </div>
      )}

      {/* DSN */}
      <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Project DSN</h3>
        <p className="text-xs text-gray-500 mb-3">
          Include this in your app's observability SDK config. Keep it secret — it authorises event
          ingestion.
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-950 border border-gray-700 rounded px-3 py-2 text-xs text-green-400 font-mono select-all">
            {project.dsn}
          </code>
          <button
            onClick={copyDSN}
            className="flex items-center gap-1 text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy
              </>
            )}
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">SDK Setup</p>
          <pre className="text-xs bg-gray-950 border border-gray-700 rounded p-3 text-green-400 overflow-x-auto">
{`import { ObserveClient } from "@africoders/shared/observability";

export const observe = new ObserveClient({
  dsn: "${project.dsn}",
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERSION,
});

// In your root layout:
observe.installGlobalHandlers();`}
          </pre>
        </div>
      </section>

      {/* Edit project — admin only */}
      {canManage && (
        <section className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-white mb-4">General</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-950 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Platform</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </section>
      )}

      {/* Danger zone — admin only */}
      {canManage && (
        <section className="bg-gray-900 border border-red-900 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-xs text-gray-500 mb-4">
            Deleting this project will permanently remove all errors, logs, metrics, and alerts.
          </p>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-950 hover:bg-red-900 text-red-400 hover:text-red-300 border border-red-800 px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : "Delete Project"}
          </button>
        </section>
      )}
    </div>
  );
}
