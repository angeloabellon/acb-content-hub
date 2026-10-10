import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CommunityReplyForm from "@/components/community/CommunityReplyForm";
import CommunityTopicFollow from "@/components/community/CommunityTopicFollow";
import { getCommunitySpace } from "@/data/community";
import { formatCommunityReplyCount } from "@/lib/community-format";
import {
  getCommunityTopicBySlug,
  getCommunityViewer,
  isCommunityBackendConfigured,
} from "@/lib/community";
import { createMetadata } from "@/lib/seo";

type CommunityTopicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CommunityTopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const topic = await getCommunityTopicBySlug(slug);

  if (!topic) {
    return { title: "Tema no encontrado | Cast To Cast Baloncesto" };
  }

  return createMetadata({
    title: `${topic.title} | Comunidad`,
    description: topic.excerpt,
    path: `/comunidad/tema/${topic.slug}`,
  });
}

export default async function CommunityTopicPage({
  params,
}: CommunityTopicPageProps) {
  const { slug } = await params;
  const topic = await getCommunityTopicBySlug(slug);

  if (!topic) notFound();

  const space = getCommunitySpace(topic.space);
  const viewer = await getCommunityViewer();
  const backendConfigured = isCommunityBackendConfigured();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <nav aria-label="Migas de pan" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/55">
        <Link href="/comunidad" className="transition-colors hover:text-orange-300">Comunidad</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/comunidad/${topic.space}`} className="transition-colors hover:text-orange-300">{space?.title}</Link>
      </nav>

      <section className="relative mb-10 overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] px-6 py-10 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:px-10 sm:py-12">
        <div className="premium-overlay" />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">{space?.eyebrow}</p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">{topic.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/60">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">Iniciado por {topic.author}</span>
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

      <section aria-label="Mensajes del tema" className="space-y-5">
        {topic.messages.map((message, index) => (
          <article key={`${message.author}-${index}`} className="rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-6 shadow-[0_10px_40px_rgba(122,12,12,0.14)] sm:p-8">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-red-700/40 bg-red-950/50 text-xs font-bold text-red-100">
                {message.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h2 className="font-bold text-white">{message.author}</h2>
                  <time className="text-sm text-white/45">{message.publishedAt}</time>
                </div>
                <p className="mt-5 leading-relaxed text-white/75">{message.body}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center sm:p-8">
        {!backendConfigured ? (
          <p className="text-sm leading-relaxed text-white/60">La participación se activará cuando se conecte la Comunidad CTC a su proyecto de datos.</p>
        ) : !viewer ? (
          <>
            <p className="text-sm leading-relaxed text-white/60">Inicia sesión para participar en la conversación.</p>
            <Link href={`/comunidad/acceso?next=/comunidad/tema/${topic.slug}`} className="mt-5 inline-flex rounded-xl border border-red-900/40 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:border-orange-400/40 hover:text-orange-300">
              Acceder para responder
            </Link>
          </>
        ) : topic.id ? (
          <CommunityReplyForm topicId={topic.id} topicSlug={topic.slug} />
        ) : (
          <p className="text-sm leading-relaxed text-white/60">Esta conversación es una muestra visual. Puedes crear un tema nuevo cuando la comunidad esté activa.</p>
        )}
      </section>
    </main>
  );
}
