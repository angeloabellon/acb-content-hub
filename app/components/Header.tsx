import "./Header.css";
import Link from "next/link";
export default function Header() {
  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur bg-black/40">
      <img src="/logoCTC.jpg" alt="Logo CTC" className="site-header-image" />
      <img src="/ctc_transparente.png" alt="CTC" className="site-header-image" />

      <nav>
          <Link href="/">Inicio</Link>

          <Link href="/videos">Vídeos</Link>

          <Link href="/news">Noticias</Link>

          <Link href="/about">Sobre nosotros</Link>
      </nav>
    </header>
  );
}