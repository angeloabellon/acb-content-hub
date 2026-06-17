import HeaderClient from "@/components/HeaderClient";
import { getActiveLiveStream } from "@/lib/youtube-live";

export default async function Header() {
  const live = await getActiveLiveStream();
  const hasLive = live.isLive && live.videoId.length > 0;

  return <HeaderClient hasLive={hasLive} />;
}