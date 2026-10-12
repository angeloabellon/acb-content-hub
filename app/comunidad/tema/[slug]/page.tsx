import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import CommunityTopicConversation from "@/components/community/CommunityTopicConversation";
import CommunityTopicFollow from "@/components/community/CommunityTopicFollow";
import { CommunityMentionText } from "@/components/community/CommunityMessageBody";
import { defaultCommunityConversationTheme, getCommunityConversation } from "@/data/community";
import { formatCommunityReplyCount } from "@/lib/community-format";
import { formatCommunityMentionText } from "@/lib/community-mentions";
import {
  getCommunityTopicBySlug,
  getCommunityTopicRedirectSlug,
  getCommunityViewer,
  getRetiredCommunityPath,
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
  const retiredPath = getRetiredCommunityPath(slug);
  if (retiredPath) {
    return createMetadata({
      title: "Comunidad | Cast To Cast Baloncesto",
      description: "Conversaciones de la Comunidad CTC.",
      path: retiredPath,
    });
  }
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
  const retiredPath = getRetiredCommunityPath(slug);
  if (retiredPath) permanentRedirect(retiredPath);
  const redirectSlug = await getCommunityTopicRedirectSlug(slug);
  if (redirectSlug) permanentRedirect(`/comunidad/tema/${redirectSlug}`);

  const topic = await getCommunityTopicBySlug(slug);

  if (!topic) notFound();

  const conversation = getCommunityConversation(topic.conversation);
  const theme = conversation?.theme ?? defaultCommunityConversationTheme;
  const viewer = await getCommunityViewer();
  const backendConfigured = isCommunityBackendConfigured();
  const profiles = viewer ? await listCommunityMentionableProfiles() : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <nav aria-label="Migas de pan" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/55">
        <Link href="/comunidad" className={`transition-colors ${theme.hoverText}`}>Comunidad</Link>
        <span aria-hidden="true">/</span>
        <span>{conversation?.title}</span>
      </nav>

      <section className={`relative mb-10 overflow-hidden rounded-3xl border px-6 py-10 sm:px-10 sm:py-12 ${theme.heroSurface}`}>
        <div className="premium-overlay" />
        <div className={`pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full blur-3xl ${theme.heroGlow}`} />
        <div className="relative z-10">
          <p className={`mb-4 text-xs font-semibold uppercase tracking-[0.2em] ${theme.eyebrow}`}>{conversation?.eyebrow}</p>
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
              <span className={`rounded-full border px-3 py-1.5 font-semibold ${theme.accentBadge}`}>
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
              theme={theme}
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
        theme={theme}
      />
    </main>
  );
}
