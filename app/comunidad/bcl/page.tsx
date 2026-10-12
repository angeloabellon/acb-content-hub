import { permanentRedirect } from "next/navigation";

import { getCommunityRootTopicSlug } from "@/data/community";

/** Legacy space URL retained for links shared before the Community reform. */
export default function ComunidadBclPage() {
  permanentRedirect(`/comunidad/tema/${getCommunityRootTopicSlug("bcl")}`);
}
