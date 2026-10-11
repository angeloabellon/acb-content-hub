"use client";

import { useActionState } from "react";

import { createCommunityReply } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";
import type { CommunityMentionableProfile } from "@/lib/community";
import CommunityMentionField from "@/components/community/CommunityMentionField";

type CommunityReplyFormProps = {
  topicId: string;
  topicSlug: string;
  profiles: CommunityMentionableProfile[];
  requestedMention?: { profile: CommunityMentionableProfile; id: number };
};

export default function CommunityReplyForm({
  topicId,
  topicSlug,
  profiles,
  requestedMention,
}: CommunityReplyFormProps) {
  const replyAction = createCommunityReply.bind(null, topicId, topicSlug);
  const [state, formAction, pending] = useActionState(
    replyAction,
    initialCommunityActionState,
  );

  return (
    <form id="community-reply-form" action={formAction} className="mt-6 text-left">
      <CommunityMentionField
        id="reply"
        name="body"
        label="Tu respuesta"
        minLength={2}
        maxLength={5000}
        rows={5}
        multiline
        placeholder="Comparte tu respuesta…"
        profiles={profiles}
        requestedMention={requestedMention}
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {state.message ? <p className={state.status === "success" ? "text-sm text-emerald-200" : "text-sm text-red-200"} aria-live="polite">{state.message}</p> : <span />}
        <button type="submit" disabled={pending} className="rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Publicando…" : "Publicar respuesta"}
        </button>
      </div>
    </form>
  );
}
