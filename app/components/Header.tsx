import "./Header.css";
import Link from "next/link";
export default function Header() {
  return (
    <header className="site-header">
      <img src="/logoCTC.jpg" alt="Cast To Cast" className="site-header-image" />
      <h1>Cast To Cast</h1>

      <nav>
          <Link href="/">Inicio</Link>

          <Link href="/videos">Vídeos</Link>

          <Link href="/news">Noticias</Link>

          <Link href="/about">Sobre nosotros</Link>
      </nav>
    </header>
  );
}