import { type NextRequest, NextResponse } from "next/server";

import {
  communityAuthCallbackPaths,
  getLegacyCommunityAuthFlow,
} from "@/lib/community-auth-callback";

/** For links issued before the purpose-specific callbacks were introduced. */
export async function GET(request: NextRequest) {
  const flow = getLegacyCommunityAuthFlow(request.nextUrl.searchParams.get("next"));
  const redirectUrl = new URL(communityAuthCallbackPaths[flow], request.url);
  redirectUrl.search = request.nextUrl.search;
  return NextResponse.redirect(redirectUrl);
}
