import { type NextRequest } from "next/server";

import { completeCommunityAuthCallback } from "@/lib/community-auth-callback-route";

export async function GET(request: NextRequest) {
  return completeCommunityAuthCallback(request, "confirmation");
}
