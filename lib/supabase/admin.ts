import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

/**
 * Resolves a public Community username only inside a Server Action. The RPC is
 * executable exclusively by service_role, so neither a browser nor an
 * authenticated participant can use it to read account email addresses.
 */
export async function resolveCommunityLoginEmail(username: string): Promise<string | undefined> {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config || !serviceRoleKey) return undefined;

  const admin = createClient(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  const { data, error } = await admin.rpc("resolve_community_login_email", {
    p_username: username,
  });

  return !error && typeof data === "string" && data ? data : undefined;
}
