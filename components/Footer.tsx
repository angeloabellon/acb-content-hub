import Link from "next/link";

import { siteConfig } from "@/config/site";

const contentLinks = [
  { label: "Vídeos", href: "/videos" },
  { label: "Podcasts", href: "/podcasts" },
  { label: "Actualidad", href: "/news" },
  { label: "Galería", href: "/galeria" },
];

const projectLinks = [
  { label: "Sobre nosotros", href: "/about" },
  { label: "Contacto y patrocinios", href: "/contacto" },
];

const socialLinks = [
  { label: "YouTube", href: "https://www.youtube.com/@casttocast_baloncesto" },
  { label: "Instagram", href: siteConfig.socials.instagram },
  { label: "X / Twitter", href: siteConfig.socials.x },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-red-900/30 bg-gradient-to-br from-[#090909] via-[#120202] to-black">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7a0c0c]/20 via-transparent to-[#e01310]/10 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="mb-14 rounded-3xl border border-red-900/30 bg-white/[0.03] p-8 md:p-10 shadow-[0_10px_40px_rgba(122,12,12,0.18)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="uppercase tracking-[0.2em] text-red-300/70 text-xs font-semibold mb-4">
                Comunidad Cast To Cast
              </p>

              <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
                Baloncesto desde la mirada del aficionado
              </h2>

              <p className="text-white/65 leading-relaxed max-w-3xl">
                Podcast, vídeo, fotografía y actualidad para seguir el
                baloncesto desde una perspectiva cercana, independiente y
                multimedia.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
              <Link
                href="/contacto"
                className="inline-flex justify-center rounded-xl bg-gradient-to-r from-[#7a0c0c]/80 to-[#e01310]/80 px-5 py-3 text-sm font-semibold text-white border border-red-900/40 transition-all duration-300 hover:-translate-y-1 hover:text-orange-300"
              >
                Contactar
              </Link>

              <Link
                href="/about"
                className="inline-flex justify-center rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:text-orange-300"
              >
                Conocer el proyecto
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Cast To Cast Baloncesto
            </h2>

            <p className="text-sm text-white/65 leading-relaxed max-w-sm">
              Plataforma multimedia de baloncesto con vídeos, podcasts,
              actualidad, fotografía deportiva y contenido desde la perspectiva
              del aficionado.
            </p>

            <p className="mt-6 text-sm text-red-300/70 font-semibold">
              Podcast · Vídeo · Fotografía · Actualidad
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/70 mb-5">
              Contenido
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              {contentLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-orange-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/70 mb-5">
              Proyecto
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              {projectLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-orange-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-red-300/70 mb-5">
              Comunidad
            </h3>

            <ul className="space-y-3 text-sm text-white/70">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-orange-300 transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6 text-sm text-white/40 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Cast To Cast Baloncesto.</p>

          <p>Baloncesto, comunidad y contenido multimedia.</p>
        </div>
      </div>
    </footer>
  );
}