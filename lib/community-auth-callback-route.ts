import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getCommunityAuthFailurePath,
  getCommunityAuthSuccessPath,
  type CommunityAuthFlow,
} from "@/lib/community-auth-callback";
import { getSupabasePublicConfig } from "@/lib/supabase/server";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

/**
 * Exchanges a Supabase email code for the session required by that flow.
 * Confirmation sessions are immediately closed: CTC's normal access path is
 * always username plus password. Recovery sessions remain available only long
 * enough to choose a new password.
 */
export async function completeCommunityAuthCallback(
  request: NextRequest,
  flow: CommunityAuthFlow,
) {
  const config = getSupabasePublicConfig();
  if (!config) return redirectTo(request, getCommunityAuthFailurePath(flow));

  const response = redirectTo(request, getCommunityAuthSuccessPath(flow));
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return redirectTo(request, getCommunityAuthFailurePath(flow));

  const flowId = request.nextUrl.searchParams.get("sb_flow_id");
  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );
  if (error) return redirectTo(request, getCommunityAuthFailurePath(flow));

  if (flow === "confirmation") {
    await supabase.auth.signOut({ scope: "local" });
  }

  return response;
}
