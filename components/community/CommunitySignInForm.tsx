"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signInCommunityWithPassword } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

type CommunitySignInFormProps = { next: string };

export default function CommunitySignInForm({ next }: CommunitySignInFormProps) {
  const [state, formAction, pending] = useActionState(
    signInCommunityWithPassword,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="community-username" className="mb-2 block text-sm font-semibold text-white/80">
          Usuario
        </label>
        <input
          id="community-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          spellCheck="false"
          placeholder="tu.usuario"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60"
        />
      </div>
      <div>
        <label htmlFor="community-password" className="mb-2 block text-sm font-semibold text-white/80">
          Contraseña
        </label>
        <input
          id="community-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
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
        {pending ? "Entrando…" : "Entrar"}
      </button>

      <div className="flex flex-wrap justify-between gap-x-5 gap-y-3 text-sm font-semibold">
        <Link href="/comunidad/recuperar" className="text-white/65 transition-colors hover:text-orange-300">
          ¿Has olvidado tu contraseña?
        </Link>
        <Link href={`/comunidad/registro?next=${encodeURIComponent(next)}`} className="text-orange-200 transition-colors hover:text-orange-300">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
