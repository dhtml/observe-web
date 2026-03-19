"use client";

import { useAuth } from "@shared/hooks/useAuth";

export type ObserveRole = "guest" | "moderator" | "admin";

/**
 * Derives a simplified observe-specific role from the platform user role.
 *
 * guest     — unauthenticated or plain `user` role: read-only
 * moderator — `moderator` or `instructor` role: can triage issues, manage alerts
 * admin     — `admin` or `superadmin`: full access including project CRUD
 */
export function useObserveRole(): ObserveRole {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return "guest";

  const r = user.role ?? "user";
  if (r === "admin" || r === "superadmin") return "admin";
  if (r === "moderator" || r === "instructor") return "moderator";
  return "guest";
}

/** True when the user has at least moderator-level access */
export function useCan(action: "triage" | "manageAlerts" | "manageProjects"): boolean {
  const role = useObserveRole();
  switch (action) {
    case "triage":
      // resolve / ignore issues
      return role === "moderator" || role === "admin";
    case "manageAlerts":
      // create / edit / delete alerts
      return role === "moderator" || role === "admin";
    case "manageProjects":
      // create / delete projects, view DSN, project settings
      return role === "admin";
  }
}
