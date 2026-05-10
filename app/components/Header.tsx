"use client";
import "./Header.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10 shadow-lg ${scrolled ? "scrolled" : ""}`}>
      <div className="site-header-content">
        <img src="/logoCTC.jpg" alt="Logo CTC" className="site-header-image" />
        <img src="/ctc_transparente.png" alt="CTC" className="site-header-image" />
        
        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={menuOpen ? "nav-open" : ""}>
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={pathname === "/" ? "active-link" : ""}
          >
            Inicio
          </Link>

          <Link
            href="/videos"
            onClick={() => setMenuOpen(false)}
            className={pathname === "/videos" ? "active-link" : ""}
          >
            Vídeos
          </Link>

          <Link
            href="/news"
            onClick={() => setMenuOpen(false)}
            className={pathname === "/news" ? "active-link" : ""}
          >
            Noticias
          </Link>

          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className={pathname === "/about" ? "active-link" : ""}
          >
            Sobre nosotros
          </Link>
        </nav>
      </div>
    </header>
  );
}