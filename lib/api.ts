import { getUrl } from "@shared/utils/domains";

const apiBase = () =>
  typeof window !== "undefined"
    ? `${getUrl("api")}/api/v1/observe`
    : `${process.env.NEXT_PUBLIC_API_URL ?? "https://api.africoders.com"}/api/v1/observe`;

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  org_slug: string;
  name: string;
  slug: string;
  platform: string;
  dsn: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStats {
  total_errors: number;
  unresolved_groups: number;
  total_logs: number;
  errors_last_24h: number;
}

export interface ErrorGroup {
  id: string;
  project_id: string;
  fingerprint: string;
  title: string;
  culprit: string;
  level: string;
  status: string;
  ai_summary?: string;
  first_seen: string;
  last_seen: string;
  event_count: number;
  user_count: number;
  assigned_to?: string;
}

export interface ErrorEvent {
  id: string;
  project_id: string;
  group_id?: string;
  fingerprint: string;
  title: string;
  culprit: string;
  level: string;
  platform: string;
  environment: string;
  release: string;
  user_id: string;
  payload: unknown;
  received_at: string;
}

export interface LogEvent {
  id: string;
  project_id: string;
  level: string;
  message: string;
  attributes?: Record<string, unknown>;
  trace_id?: string;
  span_id?: string;
  environment: string;
  service?: string;
  received_at: string;
}

export interface MetricEvent {
  id: string;
  project_id: string;
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, unknown>;
  environment: string;
  recorded_at: string;
}

export interface Alert {
  id: string;
  project_id: string;
  name: string;
  condition: string;
  threshold?: number;
  window_mins: number;
  channels: unknown[];
  enabled: boolean;
  created_at: string;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export const listProjects = () =>
  request<{ projects: Project[]; total: number }>("/projects");

export const createProject = (body: { name: string; platform?: string }) =>
  request<Project>("/projects", { method: "POST", body: JSON.stringify(body) });

export const getProject = (id: string) =>
  request<Project>(`/projects/${id}`);

export const updateProject = (id: string, body: { name?: string; platform?: string }) =>
  request<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteProject = (id: string) =>
  request<void>(`/projects/${id}`, { method: "DELETE" });

export const getProjectStats = (id: string) =>
  request<ProjectStats>(`/projects/${id}/stats`);

// ── Error Groups ──────────────────────────────────────────────────────────────

export interface GroupsQuery {
  status?: string;
  level?: string;
  limit?: number;
  offset?: number;
}

export const listGroups = (projectId: string, q: GroupsQuery = {}) => {
  const params = new URLSearchParams();
  if (q.status) params.set("status", q.status);
  if (q.level) params.set("level", q.level);
  if (q.limit) params.set("limit", String(q.limit));
  if (q.offset) params.set("offset", String(q.offset));
  return request<{ groups: ErrorGroup[]; total: number; limit: number; offset: number }>(
    `/projects/${projectId}/groups?${params}`
  );
};

export const getGroup = (projectId: string, groupId: string) =>
  request<{ group: ErrorGroup; events: ErrorEvent[] }>(
    `/projects/${projectId}/groups/${groupId}`
  );

export const updateGroup = (
  projectId: string,
  groupId: string,
  body: { status?: string; assigned_to?: string }
) =>
  request<{ group: ErrorGroup }>(`/projects/${projectId}/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

// ── Errors ────────────────────────────────────────────────────────────────────

export const listErrors = (projectId: string, groupId?: string, limit = 50, offset = 0) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (groupId) params.set("group_id", groupId);
  return request<{ errors: ErrorEvent[]; limit: number; offset: number }>(
    `/projects/${projectId}/errors?${params}`
  );
};

// ── Logs ──────────────────────────────────────────────────────────────────────

export interface LogsQuery {
  level?: string;
  service?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export const listLogs = (projectId: string, q: LogsQuery = {}) => {
  const params = new URLSearchParams();
  if (q.level) params.set("level", q.level);
  if (q.service) params.set("service", q.service);
  if (q.search) params.set("search", q.search);
  if (q.limit) params.set("limit", String(q.limit));
  if (q.offset) params.set("offset", String(q.offset));
  return request<{ logs: LogEvent[]; limit: number; offset: number }>(
    `/projects/${projectId}/logs?${params}`
  );
};

// ── Metrics ───────────────────────────────────────────────────────────────────

export const listMetrics = (
  projectId: string,
  name?: string,
  from?: string,
  to?: string
) => {
  const params = new URLSearchParams();
  if (name) params.set("name", name);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return request<{ metrics: MetricEvent[]; names: string[]; limit: number; offset: number }>(
    `/projects/${projectId}/metrics?${params}`
  );
};

// ── Alerts ────────────────────────────────────────────────────────────────────

export const listAlerts = (projectId: string) =>
  request<{ alerts: Alert[] }>(`/projects/${projectId}/alerts`);

export const createAlert = (
  projectId: string,
  body: { name: string; condition: string; threshold?: number; window_mins?: number; channels?: unknown[] }
) =>
  request<Alert>(`/projects/${projectId}/alerts`, { method: "POST", body: JSON.stringify(body) });

export const updateAlert = (
  projectId: string,
  alertId: string,
  body: { name?: string; enabled?: boolean; threshold?: number }
) =>
  request<Alert>(`/projects/${projectId}/alerts/${alertId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const deleteAlert = (projectId: string, alertId: string) =>
  request<void>(`/projects/${projectId}/alerts/${alertId}`, { method: "DELETE" });
