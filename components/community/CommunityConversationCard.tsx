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
  return (
    <Link
      href={`/comunidad/tema/${topic?.slug ?? getCommunityRootTopicSlug(conversation.key)}`}
      className="premium-hover group relative min-h-[330px] overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.18)] sm:p-9"
    >
      <div className="premium-overlay" />
      <div className="absolute -right-12 -top-8 h-52 w-52 rounded-full bg-red-800/15 blur-3xl" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <p className="uppercase tracking-[0.2em] text-xs font-semibold text-red-300/70">
            {conversation.eyebrow}
          </p>
          {conversation.competitionLogo ? (
            <Image
              src={conversation.competitionLogo.src}
              alt={conversation.competitionLogo.alt}
              width={conversation.competitionLogo.width}
              height={conversation.competitionLogo.height}
              className={`${conversation.competitionLogo.className} w-auto object-contain opacity-90`}
            />
          ) : null}
        </div>

        <div className="my-auto pt-10">
          <Image
            src={conversation.logo.src}
            alt={conversation.logo.alt}
            width={conversation.logo.width}
            height={conversation.logo.height}
            className={`${conversation.logo.className} mb-7 object-contain drop-shadow-[0_12px_20px_rgba(224,19,16,0.3)]`}
          />

          <h2 className="text-3xl font-extrabold leading-tight transition-colors duration-300 group-hover:text-orange-300">
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
          <span className="text-white transition-colors group-hover:text-orange-300">
            Abrir conversación <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
