import Link from "next/link";

import { communitySpaces } from "@/data/community";

type CommunitySpaceNavProps = {
  current?: string;
};

export default function CommunitySpaceNav({ current }: CommunitySpaceNavProps) {
  return (
    <nav
      aria-label="Espacios de Comunidad"
      className="flex flex-wrap items-center gap-2"
    >
      <Link
        href="/comunidad"
        className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          !current
            ? "border-red-700/60 bg-red-950/50 text-white"
            : "border-white/10 bg-white/[0.03] text-white/65 hover:border-orange-400/40 hover:text-orange-300"
        }`}
      >
        Todo
      </Link>
      {communitySpaces.map((space) => (
        <Link
          key={space.slug}
          href={`/comunidad/${space.slug}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            current === space.slug
              ? "border-red-700/60 bg-red-950/50 text-white"
              : "border-white/10 bg-white/[0.03] text-white/65 hover:border-orange-400/40 hover:text-orange-300"
          }`}
        >
          {space.slug === "acb" ? "ACB" : "BCL"}
        </Link>
      ))}
    </nav>
  );
}
