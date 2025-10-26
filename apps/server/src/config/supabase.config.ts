import { createClient } from "@supabase/supabase-js";
import { env } from "./env.config.js";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient && env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return supabaseClient;
}

export function getStorageBucket(): string {
  return env.SUPABASE_STORAGE_BUCKET;
}
