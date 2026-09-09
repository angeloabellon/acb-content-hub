"use client";

import { useMemo, useState, useTransition } from "react";

import {
  acceptChapterProposal,
  convertAcceptedProposalsToChapters,
  editChapterProposal,
  rejectChapterProposal,
  validateChapterProposals,
} from "@/lib/chapter-proposals";
import { formatChapterTimestamp } from "@/lib/chapters";
import type { ChapterProposal } from "@/types/chapter-proposal";
import type { Transcript } from "@/types/transcript";

type SaveAction = (slug: string, proposals: readonly ChapterProposal[], allowVersionedFile?: boolean) => Promise<{ ok: boolean; message: string; conflict?: boolean }>;

type ChapterProposalEditorProps = {
  slug: string;
  transcript: Transcript;
  initialProposals: readonly ChapterProposal[];
  excerpts: Readonly<Record<string, string>>;
  storageAvailable: boolean;
  saveAction: SaveAction;
};

function numericValue(value: string): number {
  return Number(value);
}

export function ChapterProposalEditor({
  slug, transcript, initialProposals, excerpts, storageAvailable, saveAction,
}: ChapterProposalEditorProps) {
  const [proposals, setProposals] = useState<readonly ChapterProposal[]>(initialProposals);
  const [saveMessage, setSaveMessage] = useState<string>();
  const [saving, startSaving] = useTransition();
  const proposalDiagnostics = useMemo(() => validateChapterProposals(proposals, transcript), [proposals, transcript]);
  const preview = useMemo(() => convertAcceptedProposalsToChapters(proposals, transcript), [proposals, transcript]);

  function replace(proposal: ChapterProposal) {
    setProposals((current) => current.map((item) => item.id === proposal.id ? proposal : item));
  }

  function updateDraft(proposal: ChapterProposal, changes: Partial<Pick<ChapterProposal, "title" | "startSeconds" | "endSeconds">>) {
    // Draft typing remains local; the existing editor helper is the only transition used.
    replace(editChapterProposal(proposal, changes, transcript).proposal);
  }

  function save() {
    setSaveMessage(undefined);
    startSaving(async () => {
      const result = await saveAction(slug, proposals);
      if (result.conflict && window.confirm("Ya existe un archivo local. ¿Guardar una nueva versión sin reemplazarlo?")) {
        const versionedResult = await saveAction(slug, proposals, true);
        setSaveMessage(versionedResult.message);
      } else {
        setSaveMessage(result.message);
      }
    });
  }

  return (
    <section className="mt-8 space-y-6">
      <p className="rounded-xl border border-amber-400/30 bg-amber-200/10 p-4 text-sm text-amber-100">
        Borrador privado de desarrollo. Los cambios no se publican y cada capítulo debe aceptarse explícitamente.
      </p>
      {proposals.map((proposal) => {
        const diagnostics = proposalDiagnostics.filter((item) => item.proposalId === proposal.id);
        return (
          <article key={proposal.id} className="rounded-2xl border border-white/15 bg-white/5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-orange-300">{proposal.id}</p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide">{proposal.status}</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="md:col-span-3 text-sm font-semibold">Título
                <input value={proposal.title} onChange={(event) => updateDraft(proposal, { title: event.target.value })} className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 font-normal" />
              </label>
              <label className="text-sm font-semibold">Inicio (segundos)
                <input type="number" min="0" step="0.1" value={proposal.startSeconds} onChange={(event) => updateDraft(proposal, { startSeconds: numericValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 font-normal" />
              </label>
              <label className="text-sm font-semibold">Fin (segundos)
                <input type="number" min="0" step="0.1" value={proposal.endSeconds ?? ""} onChange={(event) => updateDraft(proposal, { endSeconds: event.target.value === "" ? undefined : numericValue(event.target.value) })} className="mt-1 w-full rounded-lg border border-white/20 bg-black/30 p-2 font-normal" />
              </label>
              <dl className="text-sm text-white/70"><dt className="font-semibold text-white">Corte</dt><dd>{proposal.cutReason ?? "Inicio del episodio"}</dd><dt className="mt-2 font-semibold text-white">Confianza</dt><dd>{proposal.confidence ?? "No disponible"}</dd></dl>
            </div>
            <div className="mt-4 text-sm text-white/70"><p><strong className="text-white">Evidencia:</strong> {proposal.transcriptSegmentIds.join(", ")}</p><p className="mt-2 rounded-lg bg-black/20 p-3 italic">{excerpts[proposal.id] ?? "No hay extracto disponible."}</p></div>
            {diagnostics.length > 0 && <ul className="mt-4 list-disc pl-5 text-sm text-red-200">{diagnostics.map((item) => <li key={`${item.code}-${item.message}`}>{item.message}</li>)}</ul>}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => replace(editChapterProposal(proposal, {}, transcript).proposal)} className="rounded-lg border border-white/25 px-3 py-2 text-sm">Guardar cambios</button>
              <button type="button" onClick={() => replace(acceptChapterProposal(proposal, transcript).proposal)} className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold">Aceptar</button>
              <button type="button" onClick={() => replace(rejectChapterProposal(proposal))} className="rounded-lg bg-red-800 px-3 py-2 text-sm font-semibold">Rechazar</button>
            </div>
          </article>
        );
      })}

      <article className="rounded-2xl border border-sky-300/30 bg-sky-950/30 p-5">
        <h2 className="mt-0 text-2xl">Vista previa de capítulos aprobados</h2>
        {preview.chapters.length > 0 ? <ol className="mt-4 list-decimal pl-5">{preview.chapters.map((chapter) => <li key={chapter.id}>{formatChapterTimestamp(chapter.startSeconds)} — {chapter.title}</li>)}</ol> : <p className="text-white/70">Acepte propuestas y corrija los errores para generar una vista previa válida.</p>}
        {(preview.diagnostics.length > 0 || preview.chapterDiagnostics.length > 0) && <ul className="mt-4 list-disc pl-5 text-sm text-red-200">{[...preview.diagnostics, ...preview.chapterDiagnostics].map((item) => <li key={`${item.code}-${item.message}`}>{item.message}</li>)}</ul>}
        <button type="button" disabled={!storageAvailable || saving || preview.chapters.length === 0} onClick={save} className="mt-5 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Guardando…" : "Guardar capítulos aprobados"}</button>
        {!storageAvailable && <p className="mt-3 text-sm text-amber-100">El guardado está deshabilitado fuera del desarrollo local.</p>}
        {saveMessage && <p className="mt-3 text-sm text-white/80" role="status">{saveMessage}</p>}
      </article>
    </section>
  );
}
