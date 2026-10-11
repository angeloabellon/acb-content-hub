import Link from "next/link";

import type { CommunityTopic } from "@/data/community";
import { formatCommunityReplyCount } from "@/lib/community-format";
import { formatCommunityUnreadReplyCount } from "@/lib/community-follow";
import { CommunityMentionText } from "@/components/community/CommunityMessageBody";

type CommunityTopicListProps = {
  topics: CommunityTopic[];
  showSpace?: boolean;
};

export default function CommunityTopicList({
  topics,
  showSpace = false,
}: CommunityTopicListProps) {
  if (!topics.length) {
    return (
      <section className="rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-6 py-12 text-center shadow-[0_10px_40px_rgba(122,12,12,0.18)] sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">
          La conversación empieza aquí
        </p>
        <h3 className="mt-4 text-2xl font-bold">Todavía no hay temas</h3>
        <p className="mx-auto mt-3 max-w-lg leading-relaxed text-white/60">
          Comparte la primera opinión sobre el UCAM Murcia y abre la conversación con la comunidad.
        </p>
        <Link
          href="/comunidad/nuevo"
          className="mt-7 inline-flex rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:text-orange-300"
        >
          Crear el primer tema
        </Link>
      </section>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] shadow-[0_10px_40px_rgba(122,12,12,0.18)]">
      {topics.map((topic, index) => (
        <Link
          key={topic.slug}
          href={`/comunidad/tema/${topic.slug}`}
          className={`group grid gap-5 px-5 py-6 transition-colors duration-300 hover:bg-white/[0.035] sm:px-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-center ${
            index > 0 ? "border-t border-white/10" : ""
          }`}
        >
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-300/70">
              {showSpace && (
                <span>
                  {topic.space === "acb" ? "Liga Endesa" : "BCL"}
                </span>
              )}
              {showSpace && <span className="text-white/25">·</span>}
              <span>Por {topic.author}</span>
              {topic.following && <span className="text-white/25">·</span>}
              {topic.following && <span className="text-white/55">Siguiendo</span>}
            </div>

            <h3 className="text-xl font-bold leading-snug transition-colors duration-300 group-hover:text-orange-300 sm:text-2xl">
              <CommunityMentionText value={topic.title} mentions={topic.mentions} />
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/60 sm:text-base">
              <CommunityMentionText value={topic.excerpt} mentions={topic.mentions} />
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-white/55 md:justify-end">
            {topic.unreadReplies && topic.unreadReplies > 0 ? (
              <span className="rounded-full border border-orange-400/35 bg-orange-300/10 px-3 py-1.5 font-semibold text-orange-200">
                {formatCommunityUnreadReplyCount(topic.unreadReplies)}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5">
              {formatCommunityReplyCount(topic.replies)}
            </span>
            <span className="whitespace-nowrap">{topic.lastActivity}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
