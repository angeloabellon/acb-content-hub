import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid gap-12 md:grid-cols-4">
          {/* MARCA */}
          <div>
            <h2 className="text-2xl font-extrabold mb-4">
              Cast To Cast
            </h2>

            <p className="text-sm text-white/65 leading-relaxed">
              Plataforma multimedia de baloncesto con vídeos,
              podcasts, actualidad y fotografías.
            </p>
          </div>

          {/* CONTENIDO */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              Contenido
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/videos"
                  className="hover:text-orange-300 transition-colors"
                >
                  Vídeos
                </Link>
              </li>

              <li>
                <Link
                  href="/podcasts"
                  className="hover:text-orange-300 transition-colors"
                >
                  Podcasts
                </Link>
              </li>

              <li>
                <Link
                  href="/news"
                  className="hover:text-orange-300 transition-colors"
                >
                  Actualidad
                </Link>
              </li>

              <li>
                <Link
                  href="/galeria"
                  className="hover:text-orange-300 transition-colors"
                >
                  Galería
                </Link>
              </li>
            </ul>
          </div>

          {/* COBERTURAS */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              Coberturas
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/news/equipos/ucam"
                  className="hover:text-orange-300 transition-colors"
                >
                  UCAM Murcia
                </Link>
              </li>

              <li>
                <Link
                  href="/news/equipos/jairis"
                  className="hover:text-orange-300 transition-colors"
                >
                  Hozono Global Jairis
                </Link>
              </li>

              <li>
                <Link
                  href="/news/equipos/unicaja"
                  className="hover:text-orange-300 transition-colors"
                >
                  Unicaja Málaga
                </Link>
              </li>
            </ul>
          </div>

          {/* REDES */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/50 mb-4">
              Redes sociales
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={siteConfig.socials.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-300 transition-colors"
                >
                  X / Twitter
                </a>
              </li>

              <li>
                <a
                  href={siteConfig.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-300 transition-colors"
                >
                  Instagram
                </a>
              </li>

              <li>
                <Link
                  href="/contacto"
                  className="hover:text-orange-300 transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-white/10 mt-12 pt-6 text-sm text-white/40 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Cast To Cast Baloncesto.
          </p>

          <p>
            Plataforma multimedia de baloncesto.
          </p>
        </div>
      </div>
    </footer>
  );
}