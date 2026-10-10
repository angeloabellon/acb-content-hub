"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { signOutCommunity } from "@/app/comunidad/actions";
import type { CommunityViewer } from "@/lib/community";
import { getCommunityViewerIdentity } from "@/lib/community-viewer";

type CommunitySessionStatusProps = {
  viewer: CommunityViewer;
  variant: "header" | "mobile-menu";
  onNavigate?: () => void;
};

/** A shared signed-in account control for the global header and its mobile menu. */
export default function CommunitySessionStatus({
  viewer,
  variant,
  onNavigate,
}: CommunitySessionStatusProps) {
  const identity = getCommunityViewerIdentity(viewer);
  const [isOpen, setIsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  if (variant === "mobile-menu") {
    return (
      <div className="community-session-status community-session-status--mobile-menu">
        <Link href="/comunidad" onClick={onNavigate}>
          <span className="community-session-avatar" aria-hidden="true">
            {identity.initials}
          </span>
          <span className="community-session-mobile-copy">
            <span className="community-session-label">{identity.label}</span>
            <span className="community-session-destination">Comunidad</span>
          </span>
        </Link>
        <form action={signOutCommunity}>
          <button type="submit">Cerrar sesión</button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="community-session-status community-session-status--header"
      ref={accountRef}
    >
      <button
        type="button"
        className="community-session-trigger"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls="community-account-options"
        aria-label={`Cuenta de ${identity.label}`}
      >
        <span className="community-session-avatar" aria-hidden="true">
          {identity.initials}
        </span>
        <span className="community-session-label">{identity.label}</span>
        <svg
          className="community-session-chevron"
          aria-hidden="true"
          viewBox="0 0 16 16"
        >
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>

      {isOpen && (
        <div id="community-account-options" className="community-session-options">
          <Link href="/comunidad" onClick={() => setIsOpen(false)}>
            Comunidad
          </Link>
          <form action={signOutCommunity}>
            <button type="submit">Cerrar sesión</button>
          </form>
        </div>
      )}
    </div>
  );
}
