"use client";

import "./Header.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";
import Image from "next/image";

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
    <header
      className={`site-header sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10 shadow-lg ${
        scrolled ? "scrolled" : ""
      }`}
    >
      <div className="site-header-content">
        <Image src="/logoCTC.jpg" alt="Logo CTC" className="site-header-image" width={100} height={100} />
        <Image src="/ctc_transparente.png" alt="CTC" className="site-header-image" width={100} height={100} />

<button
  className="menu-button"
  type="button"
  onClick={() => setMenuOpen(!menuOpen)}
  aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
  aria-expanded={menuOpen}
>
  {menuOpen ? "✕" : "☰"}
</button>

        <nav className={menuOpen ? "nav-open" : ""}>
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={
pathname === item.href ||
(item.href === "/galeria" && pathname.startsWith("/galeria/")) ||
(item.href === "/directo" && pathname.startsWith("/directo"))
    ? "active-link"
    : ""
}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}