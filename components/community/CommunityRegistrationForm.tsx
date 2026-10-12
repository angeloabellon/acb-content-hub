"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerCommunityAccount } from "@/app/comunidad/actions";
import { initialCommunityActionState } from "@/lib/community-action-state";

type CommunityRegistrationFormProps = { next: string };

const inputClassName = "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-orange-400/60";

export default function CommunityRegistrationForm({ next }: CommunityRegistrationFormProps) {
  const [state, formAction, pending] = useActionState(
    registerCommunityAccount,
    initialCommunityActionState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="community-registration-username" className="mb-2 block text-sm font-semibold text-white/80">
          Nombre de usuario
        </label>
        <input
          id="community-registration-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
          pattern="[A-Za-z0-9](?:[A-Za-z0-9._-]{1,22}[A-Za-z0-9])"
          spellCheck="false"
          placeholder="tu.usuario"
          aria-describedby="community-username-help"
          className={inputClassName}
        />
        <p id="community-username-help" className="mt-2 text-xs leading-relaxed text-white/45">
          Entre 3 y 24 caracteres. Puedes usar letras, números, punto, guion y guion bajo.
        </p>
      </div>
      <div>
        <label htmlFor="community-registration-email" className="mb-2 block text-sm font-semibold text-white/80">
          Correo electrónico
        </label>
        <input id="community-registration-email" name="email" type="email" autoComplete="email" required placeholder="tu@email.com" className={inputClassName} />
      </div>
      <div>
        <label htmlFor="community-registration-password" className="mb-2 block text-sm font-semibold text-white/80">
          Contraseña
        </label>
        <input id="community-registration-password" name="password" type="password" autoComplete="new-password" required minLength={8} className={inputClassName} />
      </div>
      <div>
        <label htmlFor="community-registration-password-confirmation" className="mb-2 block text-sm font-semibold text-white/80">
          Repetir contraseña
        </label>
        <input id="community-registration-password-confirmation" name="passwordConfirmation" type="password" autoComplete="new-password" required minLength={8} className={inputClassName} />
      </div>

      {state.message && (
        <p className={state.status === "error" ? "text-sm text-red-200" : "text-sm text-emerald-200"} aria-live="polite">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="w-full rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300 disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-white/60">
        ¿Ya tienes cuenta? <Link href={`/comunidad/acceso?next=${encodeURIComponent(next)}`} className="font-semibold text-orange-200 hover:text-orange-300">Accede</Link>.
      </p>
    </form>
  );
}
