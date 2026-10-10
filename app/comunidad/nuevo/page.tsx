import type { Metadata } from "next";
import Link from "next/link";

import CommunityComposer from "@/components/community/CommunityComposer";
import CommunitySpaceNav from "@/components/community/CommunitySpaceNav";
import { getCommunityViewer, isCommunityBackendConfigured } from "@/lib/community";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Nuevo tema | Comunidad",
  description: "Abre una conversación sobre el UCAM Murcia en la Comunidad CTC.",
  path: "/comunidad/nuevo",
});

export const dynamic = "force-dynamic";

export default async function NuevoTemaPage() {
  const backendConfigured = isCommunityBackendConfigured();
  const viewer = await getCommunityViewer();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <Link href="/comunidad" className="mb-8 inline-flex text-sm text-white/65 transition-colors hover:text-orange-300">
        ← Volver a Comunidad
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-6 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:p-10">
        <div className="premium-overlay" />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">Comunidad Cast To Cast</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Nuevo tema</h1>

          {!backendConfigured ? (
            <>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/65">La composición está lista, pero la publicación se habilitará al conectar el proyecto de datos de Comunidad.</p>
              <div className="mt-8 rounded-2xl border border-orange-400/20 bg-orange-400/[0.06] px-4 py-3 text-sm text-orange-100/80">
                Falta la configuración de Supabase. Hasta entonces, las conversaciones visibles siguen siendo ejemplos estáticos.
              </div>
            </>
          ) : !viewer ? (
            <>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/65">Para publicar, accede con tu correo. No necesitas una contraseña para participar.</p>
              <Link href="/comunidad/acceso?next=/comunidad/nuevo" className="mt-8 inline-flex rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-1 hover:text-orange-300">
                Acceder para publicar
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-2xl leading-relaxed text-white/65">Abre una conversación en uno de los dos espacios de Comunidad.</p>
              <CommunityComposer />
            </>
          )}

          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="mb-4 text-sm text-white/55">Explora las conversaciones que ya están en marcha.</p>
            <CommunitySpaceNav />
          </div>
        </div>
      </section>
    </main>
  );
}
