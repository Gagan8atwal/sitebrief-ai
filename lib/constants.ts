/** Application-wide constants. Single source of truth for shared values. */

export const APP_NAME = "SiteBrief AI";
export const APP_DESCRIPTION =
  "Turn a business brief into a complete, multi-page website — strategy, sitemap, copy, and preview — with AI.";

/** Named application routes. */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  projects: "/projects",
  newProject: "/projects/new",
  settings: "/settings",
} as const;

/** Routes that require an authenticated session. */
export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/projects",
  "/settings",
] as const;

/** Routes an authenticated user should be redirected away from. */
export const AUTH_ROUTES = ["/login", "/signup"] as const;

export const PROJECT_STATUSES = [
  "draft",
  "active",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  active: "Active",
  archived: "Archived",
};

export const EVENT_TYPES = [
  "project.created",
  "project.updated",
  "project.archived",
  "version.created",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "archive",
  "restore",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;
