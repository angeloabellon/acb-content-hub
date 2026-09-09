import Link from "next/link";
import { notFound } from "next/navigation";

import { EditorLogoutButton } from "@/components/editor/EditorLogoutButton";
import { getEpisodeEditorialSummary } from "@/lib/episode-editor";
import { loadImportedEpisodeManifests } from "@/lib/episode-manifest-importer";
import { getEpisodeBySlug } from "@/lib/episodes";
import { loadImportedTranscripts } from "@/lib/transcript-importer";
import { requireEditor } from "@/lib/require-editor";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

const badgeClasses = {
  neutral: "border-white/15 bg-white/10 text-white/70",
  warning: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  danger: "border-red-400/40 bg-red-500/15 text-red-200",
  development: "border-violet-400/30 bg-violet-400/10 text-violet-200",
};

function StatusBadge({ label, tone }: { label: string; tone: keyof typeof badgeClasses }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${badgeClasses[tone]}`}>{label}</span>;
}

function DetailList({ items }: { items: ReadonlyArray<[string, string | number | undefined]> }) {
  return <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">{items.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3"><dt className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</dt><dd className="mt-1 break-all text-white/85">{value ?? "No disponible"}</dd></div>)}</dl>;
}

export default async function EpisodeEditorialDashboard({ params }: PageProps) {
  const { slug } = await params;
  await requireEditor(`/editor/episodios/${slug}`);
  const episode = getEpisodeBySlug(slug);
  if (!episode) notFound();
  const summary = await getEpisodeEditorialSummary(episode, { loadImportedTranscripts, loadImportedManifests: loadImportedEpisodeManifests });

  return <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">Editor privado · Desarrollo</p>
    <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><h1 className="text-3xl font-extrabold leading-tight md:text-5xl">{episode.title}</h1><p className="mt-3 text-white/65">Consola de lectura editorial. No publica ni modifica datos.</p></div>
      <div className="flex flex-wrap gap-3"><Link href={`/episodios/${episode.slug}`} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:border-orange-300 hover:text-orange-200">Ver ficha pública</Link><Link href={`/editor/episodios/${episode.slug}/capitulos`} className="rounded-xl bg-orange-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-orange-300">Editar capítulos</Link><EditorLogoutButton /></div>
    </div>
    <nav aria-label="Módulos editoriales" className="mt-8 flex flex-wrap gap-2 border-y border-red-900/40 py-4 text-sm"><a href="#resumen" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/10">Resumen</a><a href="#transcripcion" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/10">Transcripción</a><a href="#capitulos" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/10">Capítulos</a><a href="#publicacion" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/10">Publicación</a><span className="cursor-not-allowed rounded-lg px-3 py-2 text-white/30">Piezas derivadas · Próximamente</span><a href="#diagnostico" className="rounded-lg px-3 py-2 text-white/75 hover:bg-white/10">Diagnóstico</a></nav>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section id="resumen" className="rounded-2xl border border-red-900/40 bg-gradient-to-br from-[#561010]/70 to-black/60 p-6"><h2 className="text-xl font-bold">Resumen</h2><DetailList items={[["ID técnico", episode.id], ["Slug", episode.slug], ["Tipo", episode.kind], ["Temporada / número", [episode.season, episode.episodeNumber].filter((value) => value !== undefined).join(" / ") || undefined], ["Fecha", episode.date], ["Participantes", episode.participants.map((person) => `${person.name}${person.role ? ` · ${person.role}` : ""}`).join(", ") || undefined]]} /></section>
      <section id="transcripcion" className="rounded-2xl border border-red-900/40 bg-black/40 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Transcripción</h2><StatusBadge {...summary.transcript.statusDetail} /></div><p className="mt-3 text-sm text-white/65">{summary.transcript.statusDetail.detail}</p><DetailList items={[["Segmentos", summary.transcript.segmentCount], ["Idioma", summary.transcript.language], ["Timestamps", summary.transcript.hasTimestamps ? "Sí" : "No"], ["Versión", summary.transcript.version], ["Hash", summary.transcript.hash], ["Fuente", summary.transcript.source]]} />{summary.transcript.diagnostics.length > 0 ? <p className="mt-4 text-sm text-orange-200">Diagnóstico: {summary.transcript.diagnostics.join(" ")}</p> : null}</section>
      <section id="capitulos" className="rounded-2xl border border-red-900/40 bg-black/40 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Capítulos</h2><StatusBadge {...summary.chapters.statusDetail} /></div><p className="mt-3 text-sm text-white/65">{summary.chapters.statusDetail.detail}</p><DetailList items={[["Publicados / manuales", summary.chapters.publishedCount], ["Locales / dev", summary.chapters.localCount], ["Propuestas posibles", summary.chapters.hasProposals ? "Sí, desde transcripción" : "No disponible"]]} />{summary.chapters.localSources.length ? <ul className="mt-4 space-y-2 text-sm">{summary.chapters.localSources.map((source) => <li key={source.fileName} className="rounded-lg border border-white/10 p-3"><span className="font-semibold text-white/85">{source.fileName}</span> · {source.chapterCount} capítulos · <span className={source.valid ? "text-emerald-200" : "text-orange-200"}>{source.valid ? "válido" : source.diagnostics.join(" ")}</span></li>)}</ul> : <p className="mt-4 text-sm text-white/50">No hay archivos locales generados para este episodio.</p>}</section>
      <section id="publicacion" className="rounded-2xl border border-red-900/40 bg-black/40 p-6"><h2 className="text-xl font-bold">Publicación</h2><p className="mt-3 text-sm text-white/65">Solo lectura; estos enlaces proceden de la ficha actual.</p>{summary.publication.available.length ? <ul className="mt-4 space-y-2">{summary.publication.available.map((item) => <li key={item.platform}><a className="text-orange-200 underline decoration-orange-400/50 underline-offset-4 hover:text-orange-100" href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a></li>)}</ul> : <p className="mt-4 text-sm text-white/50">No hay enlaces de plataforma conectados.</p>}<p className="mt-4 text-sm text-white/55">Pendiente: {summary.publication.missing.map((platform) => platform === "applePodcasts" ? "Apple Podcasts" : platform === "ivoox" ? "iVoox" : platform[0].toUpperCase() + platform.slice(1)).join(", ") || "nada"}.</p></section>
    </div>
    <section id="piezas-derivadas" className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-6"><h2 className="text-xl font-bold text-white/70">Piezas derivadas</h2><p className="mt-2 text-sm text-white/50">Próximamente. Este módulo alojará clips, shorts y otras piezas cuando exista una fuente editorial.</p></section>
    <section id="diagnostico" className="mt-6 rounded-2xl border border-red-900/40 bg-black/40 p-6"><h2 className="text-xl font-bold">Diagnóstico</h2><p className="mt-2 text-sm text-white/60">Importaciones y avisos técnicos, sin resolver conflictos ni alterar fuentes.</p><div className="mt-5 grid gap-5 lg:grid-cols-3"><div><h3 className="text-sm font-bold uppercase tracking-widest text-white/55">Manifests</h3>{summary.diagnostics.manifests.length ? <ul className="mt-3 space-y-2 text-sm">{summary.diagnostics.manifests.map((item) => <li key={item.source} className="rounded-lg border border-white/10 p-3"><strong>{item.source}</strong> · {item.status}{item.messages.length ? `: ${item.messages.join(" ")}` : ""}</li>)}</ul> : <p className="mt-3 text-sm text-white/45">No conectado.</p>}</div><div><h3 className="text-sm font-bold uppercase tracking-widest text-white/55">Transcripciones importadas</h3>{summary.diagnostics.transcripts.length ? <ul className="mt-3 space-y-2 text-sm">{summary.diagnostics.transcripts.map((item) => <li key={item.source} className="rounded-lg border border-white/10 p-3"><strong>{item.source}</strong> · {item.status}{item.messages.length ? `: ${item.messages.join(" ")}` : ""}</li>)}</ul> : <p className="mt-3 text-sm text-white/45">No conectado.</p>}</div><div><h3 className="text-sm font-bold uppercase tracking-widest text-white/55">Avisos relevantes</h3>{summary.diagnostics.warnings.length ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-orange-100">{summary.diagnostics.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul> : <p className="mt-3 text-sm text-white/45">Sin warnings relevantes.</p>}</div></div></section>
  </main>;
}
