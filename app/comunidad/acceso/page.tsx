import type { Metadata } from "next";
import Link from "next/link";

import CommunityAccessForm from "@/components/community/CommunityAccessForm";
import { getCommunityViewer, isCommunityBackendConfigured } from "@/lib/community";
import { getSafeCommunityPath } from "@/lib/community-validation";
import { createMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";

export const metadata: Metadata = createMetadata({
  title: "Acceder | Comunidad",
  description: "Accede a la Comunidad CTC para abrir temas y responder.",
  path: "/comunidad/acceso",
});

type PageProps = { searchParams: Promise<{ next?: string }> };

export const dynamic = "force-dynamic";

export default async function CommunityAccessPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const safeNext = getSafeCommunityPath(next);
  const backendConfigured = isCommunityBackendConfigured();
  const viewer = backendConfigured ? await getCommunityViewer() : undefined;

  if (viewer) {
    redirect("/comunidad");
  }

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">Comunidad Cast To Cast</p>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Accede a la conversación</h1>
        <p className="mt-4 leading-relaxed text-white/65">Usaremos un enlace de un solo uso enviado a tu correo. No se crea ni se guarda una contraseña en Cast To Cast.</p>

        {backendConfigured ? (
          <CommunityAccessForm next={safeNext} />
        ) : (
          <div className="mt-8 rounded-2xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-sm leading-relaxed text-orange-100/80">
            El acceso estará disponible cuando se configure el proyecto de Comunidad.
          </div>
        )}

        <Link href="/comunidad" className="mt-8 inline-flex text-sm font-semibold text-white/65 transition-colors hover:text-orange-300">← Volver a Comunidad</Link>
      </section>
    </main>
  );
}
