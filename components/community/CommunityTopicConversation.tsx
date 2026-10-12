"use client";

import Link from "next/link";
import { useState } from "react";

import type { CommunityMessage } from "@/data/community";
import type { CommunityMentionableProfile, CommunityViewer } from "@/lib/community";
import CommunityMessageBody from "@/components/community/CommunityMessageBody";
import CommunityReplyForm from "@/components/community/CommunityReplyForm";

type CommunityTopicConversationProps = {
  messages: CommunityMessage[];
  topicId?: string;
  topicSlug: string;
  backendConfigured: boolean;
  viewer?: CommunityViewer;
  profiles: CommunityMentionableProfile[];
};

export default function CommunityTopicConversation({
  messages,
  topicId,
  topicSlug,
  backendConfigured,
  viewer,
  profiles,
}: CommunityTopicConversationProps) {
  const [requestedMention, setRequestedMention] = useState<{
    profile: CommunityMentionableProfile;
    id: number;
  }>();

  function replyTo(profile: CommunityMentionableProfile) {
    if (!viewer) {
      document.getElementById("community-reply")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setRequestedMention((current) => ({ profile, id: (current?.id ?? 0) + 1 }));
  }

  return (
    <>
      <section aria-label="Mensajes del tema" className="space-y-5">
        {messages.length === 0 ? (
          <p className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center text-sm leading-relaxed text-white/60">
            Aún no hay respuestas. Sé la primera persona en participar en esta conversación.
          </p>
        ) : null}
        {messages.map((message, index) => {
          const canReplyToMessage = Boolean(
            message.authorMention
            && (!viewer || message.authorId !== viewer.id),
          );
          return (
            <article key={message.id ?? `${message.author}-${index}`} className="rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-6 shadow-[0_10px_40px_rgba(122,12,12,0.14)] sm:p-8">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-700/40 bg-red-950/50 text-xs font-bold text-red-100">
                  {message.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <h2 className="font-bold text-white">{message.author}</h2>
                    <time className="text-sm text-white/45">{message.publishedAt}</time>
                  </div>
                  <CommunityMessageBody
                    body={message.body}
                    legacyTitle={message.legacyTitle}
                    mentions={message.mentions}
                  />
                  {canReplyToMessage ? (
                    <button
                      type="button"
                      onClick={() => replyTo(message.authorMention!)}
                      className="mt-4 inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-white/55 transition hover:bg-white/[0.06] hover:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300/60"
                      aria-label={`Responder a ${message.authorMention!.displayName}`}
                    >
                      Responder
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section id="community-reply" className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
        {!backendConfigured ? (
          <p className="text-sm leading-relaxed text-white/60">La participación se activará cuando se conecte la Comunidad CTC a su proyecto de datos.</p>
        ) : !viewer ? (
          <>
            <p className="text-sm leading-relaxed text-white/60">Inicia sesión para participar en la conversación.</p>
            <Link href={`/comunidad/acceso?next=/comunidad/tema/${topicSlug}`} className="mt-5 inline-flex rounded-xl border border-red-900/40 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:border-orange-400/40 hover:text-orange-300">
              Acceder para responder
            </Link>
          </>
        ) : topicId ? (
          <CommunityReplyForm topicId={topicId} topicSlug={topicSlug} profiles={profiles} requestedMention={requestedMention} />
        ) : (
          <p className="text-sm leading-relaxed text-white/60">Esta conversación es una muestra visual. La participación se activará cuando se conecte la Comunidad CTC a su proyecto de datos.</p>
        )}
      </section>
    </>
  );
}
