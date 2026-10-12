import type { Metadata } from "next";
import Link from "next/link";

import CommunityPasswordRecoveryForm from "@/components/community/CommunityPasswordRecoveryForm";
import { isCommunityBackendConfigured } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Recuperar contraseña | Comunidad",
  description: "Restablece tu contraseña de la Comunidad CTC.",
  path: "/comunidad/recuperar",
});

export default function CommunityPasswordRecoveryPage() {
  const backendConfigured = isCommunityBackendConfigured();
  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">Comunidad Cast To Cast</p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Recupera tu contraseña</h1>
        <p className="mt-4 leading-relaxed text-white/65">Te enviaremos un enlace seguro para elegir una nueva contraseña.</p>
        {backendConfigured ? <CommunityPasswordRecoveryForm /> : <div className="mt-8 rounded-2xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-sm leading-relaxed text-orange-100/80">El acceso estará disponible cuando se configure el proyecto de Comunidad.</div>}
        <Link href="/comunidad" className="mt-8 inline-flex text-sm font-semibold text-white/65 transition-colors hover:text-orange-300">← Volver a Comunidad</Link>
      </section>
    </main>
  );
}
