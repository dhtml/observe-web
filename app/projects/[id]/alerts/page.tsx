"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Activity, Bell, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { listAlerts, createAlert, updateAlert, deleteAlert, type Alert } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default function AlertsPage({ params }: Props) {
  const { id: projectId } = use(params);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  function load() {
    listAlerts(projectId)
      .then((r) => setAlerts(r.alerts))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleToggle(alert: Alert) {
    await updateAlert(projectId, alert.id, { enabled: !alert.enabled });
    load();
  }

  async function handleDelete(alertId: string) {
    if (!confirm("Delete this alert?")) return;
    await deleteAlert(projectId, alertId);
    load();
  }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Alerts</h2>
          <p className="text-sm text-gray-500 mt-0.5">Threshold-based notifications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Alert
        </button>
      </div>

      {showForm && (
        <AlertForm
          projectId={projectId}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {loading && (
        <div className="flex justify-center py-16">
          <Activity className="w-5 h-5 text-gray-600 animate-pulse" />
        </div>
      )}

      {!loading && alerts.length === 0 && !showForm && (
        <div className="text-center py-16">
          <Bell className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">No alerts configured.</p>
        </div>
      )}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 flex items-center gap-4"
          >
            <button
              onClick={() => handleToggle(alert)}
              className="text-gray-400 hover:text-white flex-shrink-0"
              title={alert.enabled ? "Disable alert" : "Enable alert"}
            >
              {alert.enabled ? (
                <ToggleRight className="w-6 h-6 text-green-400" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{alert.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {alert.condition}
                {alert.threshold !== undefined && ` › ${alert.threshold}`}
                {" "}· {alert.window_mins}m window
              </p>
            </div>

            <div className="flex-shrink-0">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  alert.enabled
                    ? "bg-green-950 text-green-400"
                    : "bg-gray-800 text-gray-500"
                }`}
              >
                {alert.enabled ? "Active" : "Disabled"}
              </span>
            </div>

            <button
              onClick={() => handleDelete(alert.id)}
              className="text-gray-600 hover:text-red-400 flex-shrink-0 transition-colors"
              title="Delete alert"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertForm({
  projectId,
  onCreated,
  onCancel,
}: {
  projectId: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [condition, setCondition] = useState("error_rate");
  const [threshold, setThreshold] = useState("10");
  const [windowMins, setWindowMins] = useState("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createAlert(projectId, {
        name,
        condition,
        threshold: Number(threshold),
        window_mins: Number(windowMins),
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create alert");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 border border-gray-700 rounded-lg p-5 mb-6 space-y-4 max-w-lg"
    >
      <h3 className="text-sm font-semibold text-white">New Alert</h3>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. High Error Rate"
          className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 placeholder-gray-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded px-2 py-2 text-sm focus:outline-none"
          >
            <option value="error_rate">Error Rate</option>
            <option value="event_count">Event Count</option>
            <option value="p95_latency">P95 Latency</option>
            <option value="new_issue">New Issue</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Threshold</label>
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1">Window (minutes)</label>
        <input
          type="number"
          value={windowMins}
          onChange={(e) => setWindowMins(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none"
        />
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          {loading ? "Creating…" : "Create Alert"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
