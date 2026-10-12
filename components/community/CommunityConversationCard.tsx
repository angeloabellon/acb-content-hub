import Image from "next/image";
import Link from "next/link";

import type { CommunityConversation, CommunityTopic } from "@/data/community";
import { getCommunityRootTopicSlug } from "@/data/community";

type CommunityConversationCardProps = {
  conversation: CommunityConversation;
  topic?: CommunityTopic;
};

export default function CommunityConversationCard({
  conversation,
  topic,
}: CommunityConversationCardProps) {
  const hasSingleCompetition = conversation.competitions.length === 1;

  return (
    <Link
      href={`/comunidad/tema/${topic?.slug ?? getCommunityRootTopicSlug(conversation.key)}`}
      className={`premium-hover group relative min-h-[420px] overflow-hidden rounded-3xl border p-7 ${conversation.theme.cardSurface} sm:p-9`}
    >
      <div className="premium-overlay" />
      <div className={`absolute -right-12 -top-8 h-52 w-52 rounded-full blur-3xl ${conversation.theme.cardGlow}`} />

      <div className="relative z-10 flex h-full flex-col">
        <div className={`grid gap-3 border-b border-white/10 pb-7 ${hasSingleCompetition ? "grid-cols-1" : "grid-cols-2 max-[359px]:grid-cols-1"}`}>
          {conversation.competitions.map((competition) => (
            <div
              key={competition.name}
              className={`flex min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 backdrop-blur-sm ${hasSingleCompetition ? "items-center text-center" : "items-start"}`}
            >
              <div
                className={`flex w-full items-center justify-center ${
                  hasSingleCompetition ? "h-12" : "h-10"
                }`}
              >
                <Image
                  src={competition.src}
                  alt={competition.alt}
                  width={competition.width}
                  height={competition.height}
                  className={`object-contain drop-shadow-[0_0_4px_rgba(255,255,255,0.3)] ${
                    hasSingleCompetition ? "max-h-10 max-w-[96px]" : "max-h-7 max-w-[104px]"
                  }`}
                />
              </div>
              <p className={`min-w-0 text-xs font-semibold leading-snug ${conversation.theme.competitionText}`}>
                {competition.name}
              </p>
            </div>
          ))}
        </div>

        <div className="my-auto pt-9">
          <Image
            src={conversation.logo.src}
            alt={conversation.logo.alt}
            width={conversation.logo.width}
            height={conversation.logo.height}
            className={`${conversation.logo.className} ${conversation.theme.logoShadow} mb-7 object-contain`}
          />

          <h2 className={`text-3xl font-extrabold leading-tight transition-colors duration-300 ${conversation.theme.groupHoverText}`}>
            {conversation.title}
          </h2>

          <p className="mt-4 max-w-lg leading-relaxed text-white/65">
            {conversation.description}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-5 text-sm font-semibold">
          <span className="text-white/55">
            {topic ? `${topic.replies} ${topic.replies === 1 ? "respuesta" : "respuestas"}` : "Conversación abierta"}
          </span>
          <span className={`text-white transition-colors ${conversation.theme.groupHoverText}`}>
            Abrir conversación <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
