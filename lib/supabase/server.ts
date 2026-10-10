import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabasePublicConfig } from "@/lib/supabase/config";

export { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Creates a request-scoped server client. In Server Components cookie writes are
 * intentionally ignored; `proxy.ts` refreshes the session on community routes.
 */
export async function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();
  if (!config) return undefined;

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. The route proxy does this.
        }
      },
    },
  });
}
