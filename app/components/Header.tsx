"use client";
import "./Header.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur bg-black/40">
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
    </header>
  );
}