"use client";

import { useActionState } from "react";

import { requestCommunitySignIn } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

type CommunityAccessFormProps = {
  next: string;
};

export default function CommunityAccessForm({ next }: CommunityAccessFormProps) {
  const [state, formAction, pending] = useActionState(
    requestCommunitySignIn,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="community-email" className="mb-2 block text-sm font-semibold text-white/80">
          Correo electrónico
        </label>
        <input
          id="community-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@email.com"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60"
        />
      </div>

      {state.message && (
        <p className={state.status === "error" ? "text-sm text-red-200" : "text-sm text-emerald-200"} aria-live="polite">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Enviando enlace…" : "Continuar con correo"}
      </button>
    </form>
  );
}
