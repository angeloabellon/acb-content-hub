"use client";

import { signOut } from "next-auth/react";

export function EditorLogoutButton() {
  return <button type="button" onClick={() => signOut({ callbackUrl: "/editor/login" })} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold text-white transition hover:border-red-300 hover:text-red-200">Cerrar sesión</button>;
}
