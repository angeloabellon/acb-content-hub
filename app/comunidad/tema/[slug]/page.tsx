import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import CommunityTopicConversation from "@/components/community/CommunityTopicConversation";
import CommunityTopicFollow from "@/components/community/CommunityTopicFollow";
import { CommunityMentionText } from "@/components/community/CommunityMessageBody";
import { getCommunityConversation } from "@/data/community";
import { formatCommunityReplyCount } from "@/lib/community-format";
import { formatCommunityMentionText } from "@/lib/community-mentions";
import {
  getCommunityTopicBySlug,
  getCommunityTopicRedirectSlug,
  getCommunityViewer,
  isCommunityBackendConfigured,
  listCommunityMentionableProfiles,
} from "@/lib/community";
import { createMetadata } from "@/lib/seo";

type CommunityTopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CommunityTopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const redirectSlug = await getCommunityTopicRedirectSlug(slug);
  if (redirectSlug) {
    return createMetadata({
      title: "Comunidad | Cast To Cast Baloncesto",
      description: "Conversación de la Comunidad CTC sobre el UCAM Murcia.",
      path: `/comunidad/tema/${redirectSlug}`,
    });
  }
  const topic = await getCommunityTopicBySlug(slug);

  if (!topic) {
    return { title: "Tema no encontrado | Cast To Cast Baloncesto" };
  }

  return createMetadata({
    title: `${formatCommunityMentionText(topic.title, topic.mentions)} | Comunidad`,
    description: formatCommunityMentionText(topic.excerpt, topic.mentions),
    path: `/comunidad/tema/${topic.slug}`,
  });
}

export default async function CommunityTopicPage({
  params,
}: CommunityTopicPageProps) {
  const { slug } = await params;
  const redirectSlug = await getCommunityTopicRedirectSlug(slug);
  if (redirectSlug) permanentRedirect(`/comunidad/tema/${redirectSlug}`);

  const topic = await getCommunityTopicBySlug(slug);

  if (!topic) notFound();

  const conversation = getCommunityConversation(topic.conversation);
  const viewer = await getCommunityViewer();
  const backendConfigured = isCommunityBackendConfigured();
  const profiles = viewer ? await listCommunityMentionableProfiles() : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <nav aria-label="Migas de pan" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/55">
        <Link href="/comunidad" className="transition-colors hover:text-orange-300">Comunidad</Link>
        <span aria-hidden="true">/</span>
        <span>{conversation?.title}</span>
      </nav>

      <section className="relative mb-10 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-6 py-10 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-10 sm:py-12">
        <div className="premium-overlay" />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">{conversation?.eyebrow}</p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            <CommunityMentionText value={topic.title} mentions={topic.mentions} />
          </h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
              Conversación principal
            </span>
            <span>{formatCommunityReplyCount(topic.replies)}</span>
            <span>Última actividad {topic.lastActivity.toLowerCase()}</span>
            {topic.unreadReplies && topic.unreadReplies > 0 ? (
              <span className="rounded-full border border-orange-400/35 bg-orange-300/10 px-3 py-1.5 font-semibold text-orange-200">
                {topic.unreadReplies} {topic.unreadReplies === 1 ? "nueva" : "nuevas"}
              </span>
            ) : null}
          </div>
          {viewer && topic.id && (
            <CommunityTopicFollow
              topicId={topic.id}
              topicSlug={topic.slug}
              isFollowing={Boolean(topic.following)}
              unreadReplies={topic.unreadReplies ?? 0}
            />
          )}
        </div>
      </section>

      <CommunityTopicConversation
        messages={topic.messages}
        topicId={topic.id}
        topicSlug={topic.slug}
        backendConfigured={backendConfigured}
        viewer={viewer}
        profiles={profiles}
      />
    </main>
  );
}
