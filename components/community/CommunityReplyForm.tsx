"use client";

import { useActionState } from "react";

import { createCommunityReply } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

type CommunityReplyFormProps = {
  topicId: string;
  topicSlug: string;
};

export default function CommunityReplyForm({
  topicId,
  topicSlug,
}: CommunityReplyFormProps) {
  const replyAction = createCommunityReply.bind(null, topicId, topicSlug);
  const [state, formAction, pending] = useActionState(
    replyAction,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-6 text-left">
      <label htmlFor="reply" className="sr-only">Tu respuesta</label>
      <textarea id="reply" name="body" minLength={2} maxLength={5000} required rows={5} placeholder="Comparte tu respuesta…" className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60" />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {state.message ? <p className={state.status === "success" ? "text-sm text-emerald-200" : "text-sm text-red-200"} aria-live="polite">{state.message}</p> : <span />}
        <button type="submit" disabled={pending} className="rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Publicando…" : "Publicar respuesta"}
        </button>
      </div>
    </form>
  );
}
