import type { Metadata } from "next";
import { redirect } from "next/navigation";

import CommunityNewPasswordForm from "@/components/community/CommunityNewPasswordForm";
import { getCommunityViewer, isCommunityBackendConfigured } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Nueva contraseña | Comunidad",
  description: "Elige una nueva contraseña para la Comunidad CTC.",
  path: "/comunidad/nueva-contrasena",
});

export const dynamic = "force-dynamic";

export default async function CommunityNewPasswordPage() {
  if (!isCommunityBackendConfigured() || !await getCommunityViewer()) {
    redirect("/comunidad/recuperar?error=enlace");
  }

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">Comunidad Cast To Cast</p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Elige una nueva contraseña</h1>
        <p className="mt-4 leading-relaxed text-white/65">Usa una contraseña de al menos ocho caracteres.</p>
        <CommunityNewPasswordForm />
      </section>
    </main>
  );
}
