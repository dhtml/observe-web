"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Activity, BarChart2 } from "lucide-react";
import { listMetrics, type MetricEvent } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default function MetricsPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [metrics, setMetrics] = useState<MetricEvent[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listMetrics(projectId, selectedName || undefined)
      .then((r) => {
        setMetrics(r.metrics);
        setNames(r.names ?? []);
      })
      .finally(() => setLoading(false));
  }, [projectId, selectedName]);

  // Group metrics by name for summary
  const byName = metrics.reduce<Record<string, MetricEvent[]>>((acc, m) => {
    acc[m.name] = acc[m.name] ?? [];
    acc[m.name].push(m);
    return acc;
  }, {});

  const summary = Object.entries(byName).map(([name, events]) => {
    const values = events.map((e) => e.value);
    return {
      name,
      count: events.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      last: values[0],
      unit: events[0]?.unit ?? "",
    };
  });

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Metrics</h2>
          <p className="text-sm text-gray-500 mt-0.5">Numeric performance metrics</p>
        </div>
      </div>

      {/* Name filter */}
      {names.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <button
            onClick={() => setSelectedName("")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              selectedName === ""
                ? "bg-gray-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          {names.map((n) => (
            <button
              key={n}
              onClick={() => setSelectedName(n)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors font-mono ${
                selectedName === n
                  ? "bg-gray-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
        </div>
      )}

      {!loading && metrics.length === 0 && (
        <div className="text-center py-16">
          <BarChart2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No metrics recorded yet.</p>
        </div>
      )}

      {/* Summary cards */}
      {!selectedName && summary.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {summary.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelectedName(s.name)}
              className="text-left bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 hover:border-gray-700 transition-colors"
            >
              <p className="text-sm font-mono text-green-400 mb-3 truncate">{s.name}</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <MetricStat label="Last" value={fmt(s.last, s.unit)} />
                <MetricStat label="Min" value={fmt(s.min, s.unit)} />
                <MetricStat label="Max" value={fmt(s.max, s.unit)} />
                <MetricStat label="Count" value={String(s.count)} />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Data table */}
      {selectedName && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-3 font-mono">{selectedName}</h3>
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Time</th>
                  <th className="text-right px-4 py-2 text-gray-500 font-medium">Value</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Environment</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800">
                    <td className="px-4 py-2 text-gray-500 font-mono">
                      {new Date(m.recorded_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-green-400 font-mono text-right font-bold">
                      {m.value}{m.unit ? ` ${m.unit}` : ""}
                    </td>
                    <td className="px-4 py-2 text-gray-400">{m.environment}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {m.tags ? JSON.stringify(m.tags) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function fmt(v: number, unit?: string): string {
  const s = v % 1 === 0 ? String(v) : v.toFixed(2);
  return unit ? `${s} ${unit}` : s;
}
