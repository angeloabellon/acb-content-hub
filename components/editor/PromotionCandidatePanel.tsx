"use client";

import { useState, useTransition } from "react";

import type { PublicEpisodeCandidate, PublicEpisodeDiffItem } from "@/types/public-episode-candidate";

type GenerateArtifactAction = (slug: string, approvedForPreview: boolean) => Promise<{ ok: boolean; message: string }>;
type PreviewPromotionAction = (slug: string) => Promise<{ ok: boolean; message: string; token?: string; operation?: "insert" | "update"; fields?: ReadonlyArray<{ field: string; before?: unknown; after: unknown; changed: boolean }> }>;
type ApplyPromotionAction = (slug: string, token: string, confirmed: boolean) => Promise<{ ok: boolean; message: string }>;

type PromotionCandidatePanelProps = {
  slug: string;
  candidate: PublicEpisodeCandidate;
  diff: readonly PublicEpisodeDiffItem[];
  storageAvailable: boolean;
  approvedArtifactAvailable: boolean;
  promotionWriteAvailable: boolean;
  generateArtifactAction: GenerateArtifactAction;
  previewPromotionAction: PreviewPromotionAction;
  applyPromotionAction: ApplyPromotionAction;
};

const kindLabels = { unchanged: "Sin cambios", added: "Añadido", removed: "Retirado", changed: "Modificado" } as const;
const kindClasses = { unchanged: "text-white/55", added: "text-emerald-200", removed: "text-red-200", changed: "text-amber-200" } as const;

function display(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "string") return value || "(vacío)";
  return JSON.stringify(value, null, 2);
}

export function PromotionCandidatePanel({ slug, candidate, diff, storageAvailable, approvedArtifactAvailable, promotionWriteAvailable, generateArtifactAction, previewPromotionAction, applyPromotionAction }: PromotionCandidatePanelProps) {
  const [status, setStatus] = useState(candidate.status);
  const [message, setMessage] = useState<string>();
  const [saving, startSaving] = useTransition();
  const [preview, setPreview] = useState<Awaited<ReturnType<PreviewPromotionAction>>>();
  const [confirmed, setConfirmed] = useState(false);
  const blocked = status === "blocked";
  const approved = status === "approved";

  function generateArtifact() {
    setMessage(undefined);
    startSaving(async () => setMessage((await generateArtifactAction(slug, approved)).message));
  }
  function previewPromotion() { setMessage(undefined); startSaving(async () => { const result = await previewPromotionAction(slug); setPreview(result); setMessage(result.message); }); }
  function applyPromotion() { const previewToken = preview?.token; if (!previewToken) return; setMessage(undefined); startSaving(async () => { const result = await applyPromotionAction(slug, previewToken, confirmed); setMessage(result.message); if (!result.ok) setPreview(undefined); }); }

  return <section id="promocion" className="mt-6 rounded-2xl border border-sky-300/30 bg-sky-950/20 p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Promoción a público</h2><p className="mt-2 text-sm text-white/65">Vista previa privada. No modifica <code>data/episodes.ts</code> ni publica nada.</p></div><span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${blocked ? "border-red-400/40 bg-red-500/15 text-red-100" : approved ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100" : "border-sky-400/40 bg-sky-500/15 text-sky-100"}`}>{status}</span></div>
    <p className="mt-4 text-sm text-white/60">Origen del candidato: {candidate.sourceSummary.candidateSource}. Versión de preview: {candidate.version}.</p>
    {candidate.validation.length ? <ul className="mt-4 space-y-2 text-sm">{candidate.validation.map((item) => <li key={`${item.code}-${item.field}`} className={item.severity === "error" ? "text-red-200" : "text-amber-200"}>{item.severity === "error" ? "Bloqueo" : "Aviso"}{item.field ? ` · ${item.field}` : ""}: {item.message}</li>)}</ul> : <p className="mt-4 text-sm text-emerald-200">Sin bloqueos técnicos. El candidato está listo para revisión humana.</p>}
    <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[700px] border-collapse text-left text-sm"><thead className="text-xs uppercase tracking-wide text-white/45"><tr><th className="border-b border-white/10 p-3">Campo</th><th className="border-b border-white/10 p-3">Cambio</th><th className="border-b border-white/10 p-3">Público actual</th><th className="border-b border-white/10 p-3">Candidato</th></tr></thead><tbody>{diff.map((item) => <tr key={item.field} className="align-top"><th className="border-b border-white/10 p-3 font-semibold text-white/80">{item.field}</th><td className={`border-b border-white/10 p-3 ${kindClasses[item.kind]}`}>{kindLabels[item.kind]}</td><td className="max-w-xs whitespace-pre-wrap break-words border-b border-white/10 p-3 text-white/65">{display(item.current)}</td><td className="max-w-xs whitespace-pre-wrap break-words border-b border-white/10 p-3 text-white/90">{display(item.candidate)}</td></tr>)}</tbody></table></div>
    <div className="mt-6 flex flex-wrap gap-3"><a href={`/episodios/${slug}#transcripcion`} className="rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white">Ver transcripción</a><a href={`/editor/episodios/${slug}/capitulos`} className="rounded-lg border border-white/25 px-4 py-3 text-sm font-bold text-white">Revisar capítulos</a><button type="button" disabled={blocked || approved} onClick={() => setStatus("approved")} className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Aprobar candidato</button><button type="button" disabled={!approved || !storageAvailable || saving} onClick={generateArtifact} className="rounded-lg bg-orange-400 px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Generando…" : "Generar artefacto aprobado"}</button></div>
    <p className="mt-3 text-sm text-white/55">{blocked ? "Un candidato bloqueado no se puede aprobar." : approved ? "Aprobado solo para esta vista. El siguiente botón escribe un JSON local versionado." : "La aprobación de esta iteración solo cambia la vista previa en memoria."}</p>
    {!storageAvailable ? <p className="mt-2 text-sm text-amber-100">La generación de artefactos solo está disponible en desarrollo local con el editor habilitado.</p> : null}
    {approvedArtifactAvailable ? <div className="mt-6 rounded-xl border border-sky-300/20 bg-black/20 p-4"><p className="text-sm text-white/75">Hay un artefacto aprobado local. Primero genera un patch revisable; esta acción no escribe nada.</p><button type="button" disabled={saving} onClick={previewPromotion} className="mt-3 rounded-lg bg-sky-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50">Previsualizar promoción pública</button>{preview?.ok ? <div className="mt-4"><p className="text-sm font-semibold text-emerald-200">Propuesta: {preview.operation === "insert" ? "insertar episodio" : "actualizar episodio existente por ID técnico"}.</p><ul className="mt-2 space-y-1 text-sm text-white/70">{preview.fields?.filter((field) => field.changed).map((field) => <li key={field.field}>{field.field}: {display(field.before)} → {display(field.after)}</li>)}</ul><label className="mt-4 flex items-center gap-2 text-sm text-white/85"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /> Confirmo que he revisado este patch.</label><button type="button" disabled={!promotionWriteAvailable || !confirmed || saving} onClick={applyPromotion} className="mt-3 rounded-lg bg-orange-400 px-4 py-3 text-sm font-bold text-black disabled:opacity-50">Aplicar promoción</button>{!promotionWriteAvailable ? <p className="mt-2 text-sm text-amber-100">Aplicar solo está disponible en desarrollo local; nunca en producción o Vercel.</p> : null}</div> : null}</div> : null}
    {message ? <p className="mt-3 text-sm text-white/85" role="status">{message}</p> : null}
  </section>;
}
