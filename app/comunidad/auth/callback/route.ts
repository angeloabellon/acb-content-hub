import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSafeCommunityPath } from "@/lib/community-validation";
import { getSupabasePublicConfig } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const destination = getSafeCommunityPath(request.nextUrl.searchParams.get("next"));
  const redirectUrl = new URL(destination, request.url);
  const config = getSupabasePublicConfig();

  if (!config) {
    redirectUrl.pathname = "/comunidad/acceso";
    redirectUrl.searchParams.set("error", "configuracion");
    return NextResponse.redirect(redirectUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
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
  if (!code) {
    redirectUrl.pathname = "/comunidad/acceso";
    redirectUrl.searchParams.set("error", "enlace");
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    redirectUrl.pathname = "/comunidad/acceso";
    redirectUrl.searchParams.set("error", "enlace");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
