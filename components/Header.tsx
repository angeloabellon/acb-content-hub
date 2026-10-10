import HeaderClient from "@/components/HeaderClient";
import { getCommunityViewer } from "@/lib/community";
import { cookies } from "next/headers";

export default async function Header() {
  // The account chip depends on request cookies even when Supabase is disabled
  // in a local build, so this header must stay request-aware on every route.
  await cookies();

  const viewer = await getCommunityViewer();

  return <HeaderClient viewer={viewer} />;
}
