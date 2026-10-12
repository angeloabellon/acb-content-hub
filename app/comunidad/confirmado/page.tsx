import type { Metadata } from "next";
import Link from "next/link";

import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Correo confirmado | Comunidad",
  description: "Confirmación de correo de Comunidad CTC.",
  path: "/comunidad/confirmado",
});

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function CommunityEmailConfirmedPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const invalidLink = error === "enlace";

  return (
    <main className="mx-auto flex min-h-[65vh] max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-red-900/30 bg-gradient-to-br from-[#140303] via-black to-[#220505] p-7 shadow-[0_10px_40px_rgba(122,12,12,0.22)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/70">Comunidad Cast To Cast</p>
        {invalidLink ? (
          <>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">No se ha podido confirmar el correo</h1>
            <p className="mt-4 leading-relaxed text-white/65" role="alert">
              El enlace de confirmación no es válido o ha caducado. Vuelve a iniciar el registro para recibir uno nuevo.
            </p>
            <Link href="/comunidad/registro" className="mt-8 inline-flex rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300">
              Volver al registro
            </Link>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Correo confirmado</h1>
            <p className="mt-4 leading-relaxed text-white/65">
              Correo confirmado correctamente. Ya puedes acceder a Comunidad CTC con tu usuario y contraseña.
            </p>
            <Link href="/comunidad/acceso" className="mt-8 inline-flex rounded-xl border border-red-900/40 bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-orange-300">
              Iniciar sesión
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
