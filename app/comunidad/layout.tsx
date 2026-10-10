import type { ReactNode } from "react";

import CommunitySessionStatus from "@/components/community/CommunitySessionStatus";
import { getCommunityViewer, isCommunityBackendConfigured } from "@/lib/community";

type CommunityLayoutProps = {
  children: ReactNode;
};

export default async function CommunityLayout({ children }: CommunityLayoutProps) {
  const viewer = isCommunityBackendConfigured()
    ? await getCommunityViewer()
    : undefined;

  return (
    <>
      {viewer && <CommunitySessionStatus viewer={viewer} />}
      {children}
    </>
  );
}
