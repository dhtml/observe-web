"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Activity, Tag, Clock } from "lucide-react";
import { listReleases, type Release } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReleasesPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReleases(projectId)
      .then((r) => setReleases(r.releases))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Releases</h2>
        <p className="text-sm text-gray-500 mt-0.5">Tracked deployments and versions</p>
      </div>

      {releases.length === 0 && (
        <div className="text-center py-16">
          <Tag className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No releases tracked yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Releases are auto-tracked when events include a <code className="text-green-400">release</code> field.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {releases.map((r) => (
          <div
            key={`${r.version}-${r.environment}`}
            className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 flex items-center gap-4"
          >
            <Tag className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-sm text-white font-medium">{r.version}</span>
                <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                  {r.environment}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  First: {new Date(r.first_seen).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last: {new Date(r.last_seen).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
