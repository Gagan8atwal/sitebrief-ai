/**
 * Database type definitions.
 *
 * Hand-authored to match `supabase/migrations`. Once a Supabase project is
 * linked, regenerate with:
 *   supabase gen types typescript --linked > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          status: Database["public"]["Enums"]["project_status"];
          brief: Json;
          website: Json;
          last_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          brief?: Json;
          website?: Json;
          last_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          status?: Database["public"]["Enums"]["project_status"];
          brief?: Json;
          website?: Json;
          last_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      project_versions: {
        Row: {
          id: string;
          project_id: string;
          version: number;
          content: Json;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version: number;
          content?: Json;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          version?: number;
          content?: Json;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          project_id: string | null;
          actor_id: string | null;
          type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          actor_id?: string | null;
          type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          actor_id?: string | null;
          type?: string;
          payload?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      website_versions: {
        Row: {
          id: string;
          project_id: string;
          version: number;
          label: string | null;
          content: Json;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          version: number;
          label?: string | null;
          content?: Json;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          version?: number;
          label?: string | null;
          content?: Json;
          created_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "website_versions_project_id_fkey";
            columns: ["project_id"];
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      project_status: "draft" | "active" | "archived";
    };
    CompositeTypes: Record<never, never>;
  };
};

/** Convenience row aliases. */
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert =
  Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate =
  Database["public"]["Tables"]["projects"]["Update"];
export type ProjectVersion =
  Database["public"]["Tables"]["project_versions"]["Row"];
export type EventRow = Database["public"]["Tables"]["events"]["Row"];
export type AuditLogRow = Database["public"]["Tables"]["audit_log"]["Row"];
export type WebsiteVersionRow =
  Database["public"]["Tables"]["website_versions"]["Row"];
