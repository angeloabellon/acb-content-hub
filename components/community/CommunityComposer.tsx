"use client";

import { useActionState } from "react";

import { createCommunityTopic } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

export default function CommunityComposer() {
  const [state, formAction, pending] = useActionState(
    createCommunityTopic,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="space">
          Espacio
        </label>
        <select id="space" name="space" required className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white outline-none transition focus:border-orange-400/60">
          <option value="acb">UCAM Murcia en ACB</option>
          <option value="bcl">UCAM Murcia en BCL</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="title">
          Título
        </label>
        <input id="title" name="title" minLength={8} maxLength={140} required placeholder="Abre una conversación" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-white/80" htmlFor="body">
          Tu mensaje
        </label>
        <textarea id="body" name="body" minLength={12} maxLength={5000} required rows={7} placeholder="Comparte tu opinión con la comunidad…" className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60" />
      </div>
      {state.message && <p className="text-sm text-red-200" aria-live="polite">{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Publicando…" : "Publicar tema"}
      </button>
    </form>
  );
}
