import HeaderClient from "@/components/HeaderClient";
import { getCommunityViewer } from "@/lib/community";
import { getActiveLiveStream } from "@/lib/youtube-live";
import { cookies } from "next/headers";

export default async function Header() {
  // The account chip depends on request cookies even when Supabase is disabled
  // in a local build, so this header must stay request-aware on every route.
  await cookies();

  const [live, viewer] = await Promise.all([
    getActiveLiveStream(),
    getCommunityViewer(),
  ]);
  const hasLive = live.isLive && live.videoId.length > 0;

  return <HeaderClient hasLive={hasLive} viewer={viewer} />;
}
