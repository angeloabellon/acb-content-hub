"use client";

import { useActionState } from "react";

import { updateCommunityPassword } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

export default function CommunityNewPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updateCommunityPassword,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="community-new-password" className="mb-2 block text-sm font-semibold text-white/80">Nueva contraseña</label>
        <input id="community-new-password" name="password" type="password" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60" />
      </div>
      <div>
        <label htmlFor="community-new-password-confirmation" className="mb-2 block text-sm font-semibold text-white/80">Repetir contraseña</label>
        <input id="community-new-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={8} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60" />
      </div>
      {state.message && <p className="text-sm text-red-200" aria-live="polite">{state.message}</p>}
      <button type="submit" disabled={pending} className="w-full rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Guardando…" : "Guardar nueva contraseña"}
      </button>
    </form>
  );
}
