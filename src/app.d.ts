import type { Session, SupabaseClient, User } from "@supabase/supabase-js";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: User | null;
      }>;
      session: Session | null;
      user: User | null;
    }
    interface PageData {
      session?: Session | null;
      user?: User | null;
      supabase?: SupabaseClient;
      profile?: {
        id: string;
        username: string | null;
        avatar_url: string | null;
        displayname?: string | null;
        level?: number | null;
      } | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
