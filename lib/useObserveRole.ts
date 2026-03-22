"use client";

import { useAuth } from "@shared/hooks/useAuth";

export type ObserveRole = "guest" | "moderator" | "admin";

/**
 * Derives a simplified observe-specific role from the platform user role.
 *
 * guest     — unauthenticated: read-only landing page
 * moderator — `moderator` or `instructor` role: can triage issues, manage alerts
 * admin     — any other authenticated user, `admin`, or `superadmin`: full access
 *
 * For a self-hosted observability tool every authenticated team member
 * needs to create projects, view DSNs, and triage errors.
 */
export function useObserveRole(): ObserveRole {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return "guest";

  const r = user.role ?? "user";
  if (r === "admin" || r === "superadmin") return "admin";
  if (r === "moderator" || r === "instructor") return "moderator";
  return "admin";
}

/** True when the user has at least the required role level */
export function useCan(action: "triage" | "manageAlerts" | "manageProjects"): boolean {
  const role = useObserveRole();
  switch (action) {
    case "triage":
      return role === "moderator" || role === "admin";
    case "manageAlerts":
      return role === "moderator" || role === "admin";
    case "manageProjects":
      return role === "admin";
  }
}
