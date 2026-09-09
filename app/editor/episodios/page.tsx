import Link from "next/link";

import { EditorLogoutButton } from "@/components/editor/EditorLogoutButton";
import { getEpisodes } from "@/lib/episodes";
import { requireEditor } from "@/lib/require-editor";

export const dynamic = "force-dynamic";

export default async function EditorialEpisodesPage() {
  await requireEditor("/editor/episodios");
  return <main className="mx-auto max-w-6xl px-6 py-12 md:py-16">
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">Cast To Cast · Editorial</p><h1 className="mt-3 text-3xl font-extrabold md:text-5xl">Episodios</h1><p className="mt-3 text-white/65">Selecciona un episodio para consultar su consola editorial.</p></div>
      <EditorLogoutButton />
    </div>
    <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{getEpisodes().map((episode) => <li key={episode.id}><Link href={`/editor/episodios/${episode.slug}`} className="block rounded-2xl border border-red-900/45 bg-black/35 p-5 transition hover:border-orange-300/70 hover:bg-red-950/20"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">{episode.kind}</p><h2 className="mt-2 font-bold text-white">{episode.title}</h2><p className="mt-2 text-sm text-white/60">{episode.date}</p></Link></li>)}</ul>
  </main>;
}
