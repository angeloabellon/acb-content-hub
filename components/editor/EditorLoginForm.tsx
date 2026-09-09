"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type EditorLoginFormProps = { callbackUrl: string; configured: boolean };

export function EditorLoginForm({ callbackUrl, configured }: EditorLoginFormProps) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
    });
    if (result?.error) {
      setError("No se ha podido iniciar sesión. Revisa tus credenciales e inténtalo de nuevo.");
      setPending(false);
      return;
    }
    window.location.assign(callbackUrl);
  }

  return <form action={submit} className="mt-8 space-y-5" noValidate>
    <div>
      <label htmlFor="email" className="text-sm font-semibold text-white">Correo electrónico</label>
      <input id="email" name="email" type="email" autoComplete="email" required disabled={!configured || pending} className="mt-2 w-full rounded-xl border border-white/20 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:opacity-60" />
    </div>
    <div>
      <label htmlFor="password" className="text-sm font-semibold text-white">Contraseña</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required disabled={!configured || pending} className="mt-2 w-full rounded-xl border border-white/20 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-300/40 disabled:cursor-not-allowed disabled:opacity-60" />
    </div>
    {error ? <p className="rounded-lg border border-red-400/35 bg-red-950/50 px-3 py-2 text-sm text-red-100" role="alert">{error}</p> : null}
    {!configured ? <p className="rounded-lg border border-amber-400/35 bg-amber-950/40 px-3 py-2 text-sm text-amber-100" role="status">El acceso editorial no está disponible en este entorno.</p> : null}
    <button type="submit" disabled={!configured || pending} className="w-full rounded-xl bg-orange-400 px-4 py-3 font-bold text-black transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Accediendo…" : "Acceder al panel"}</button>
  </form>;
}
