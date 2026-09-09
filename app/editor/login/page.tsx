import { EditorLoginForm } from "@/components/editor/EditorLoginForm";
import { getSafeEditorCallbackUrl, isEditorAuthConfigured } from "@/lib/editor-auth";

export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ callbackUrl?: string }> };

export default async function EditorLoginPage({ searchParams }: PageProps) {
  const { callbackUrl } = await searchParams;
  return <main className="flex min-h-[70vh] items-center justify-center px-6 py-12">
    <section className="w-full max-w-md rounded-3xl border border-red-900/50 bg-gradient-to-br from-[#571010] to-[#100606] p-7 shadow-2xl shadow-black/40 md:p-9">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-300">Cast To Cast · Editorial</p>
      <h1 className="mt-3 text-3xl font-extrabold text-white">Acceso privado</h1>
      <p className="mt-3 text-sm leading-6 text-white/70">Inicia sesión para continuar con las herramientas editoriales.</p>
      <EditorLoginForm callbackUrl={getSafeEditorCallbackUrl(callbackUrl)} configured={isEditorAuthConfigured()} />
    </section>
  </main>;
}
