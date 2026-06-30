import "server-only";

import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type {
  AuditLogRow,
  EventRow,
  Profile,
  Project,
} from "@/types/database";

/**
 * Admin/owner read layer. Every query runs through the RLS-bound client, so the
 * database itself enforces that only owner/admin roles can read across users
 * (see the `*_select_admin` policies). No service-role key is used.
 */

async function count(
  table: "profiles" | "projects" | "project_versions" | "website_versions",
  filter?: { column: string; value: string },
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter.column, filter.value);
  const { count: n, error } = await query;
  if (error) {
    logger.warn("admin count failed", { table, error: error.message });
    return 0;
  }
  return n ?? 0;
}

export type AdminOverview = {
  users: number;
  customers: number;
  admins: number;
  projects: number;
  briefGenerations: number;
  websiteGenerations: number;
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const [users, customers, admins, projects, briefGenerations, websiteGenerations] =
    await Promise.all([
      count("profiles"),
      count("profiles", { column: "role", value: "customer" }),
      count("profiles", { column: "role", value: "admin" }),
      count("projects"),
      count("project_versions"),
      count("website_versions"),
    ]);
  return { users, customers, admins, projects, briefGenerations, websiteGenerations };
}

export async function listProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    logger.warn("listProfiles failed", { error: error.message });
    return [];
  }
  return data;
}

export async function listCustomers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export type AdminProject = Project & { owner_email: string | null };

export async function listAllProjects(): Promise<AdminProject[]> {
  const supabase = await createClient();
  const [projectsRes, profilesRes] = await Promise.all([
    supabase.from("projects").select("*").order("updated_at", { ascending: false }),
    supabase.from("profiles").select("id, email"),
  ]);
  if (projectsRes.error || !projectsRes.data) return [];
  const emails = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.email]),
  );
  return projectsRes.data.map((p) => ({
    ...p,
    owner_email: emails.get(p.owner_id) ?? null,
  }));
}

export async function listEvents(limit = 50): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

export async function listAudit(limit = 50): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

export async function getOwnerEmail(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("owner_email")
    .eq("id", true)
    .maybeSingle();
  return data?.owner_email ?? null;
}
