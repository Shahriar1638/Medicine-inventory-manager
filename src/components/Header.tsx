"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import {
  ChartIcon,
  GridIcon,
  HomeIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  XIcon,
} from "@/components/icons";

export default function Header() {
  const pathname = usePathname();
  const { toggleTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="Medix">
          <svg
            viewBox="96 36 208 64"
            style={{ height: 28, width: "auto", display: "block", flexShrink: 0 }}
            role="img"
            aria-label="Medix"
          >
            <g transform="translate(106, 25)">
              <path d="M 0 70 V 20 H 12 L 22 46 L 32 20 H 44 V 70 H 33 V 38 L 24 58 H 20 L 11 38 V 70 Z" fill="currentColor" />
              <path d="M 52 20 H 84 V 31 H 64 V 39 H 80 V 50 H 64 V 59 H 84 V 70 H 52 Z" fill="currentColor" />
              <path d="M 92 20 H 114 C 126 20 132 26 132 36 V 54 C 132 64 126 70 114 70 H 92 Z M 104 31 V 59 H 113 C 119 59 120 56 120 52 V 38 C 120 34 119 31 113 31 Z" fill="currentColor" />
              <circle cx="147" cy="22" r="5" fill="#0284C7" />
              <rect x="142" y="34" width="10" height="36" rx="3" fill="currentColor" />
              <path d="M 160 34 L 188 70" stroke="#0284C7" strokeWidth="8" strokeLinecap="round" />
              <path d="M 188 34 L 160 70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            </g>
          </svg>
        </Link>

        <div className="spacer" />

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
            <HomeIcon width={16} height={16} />
            Medicine Lists
          </Link>
          <Link
            href="/inventory"
            className={`nav-link ${pathname === "/inventory" ? "active" : ""}`}
            onClick={closeMenu}
          >
            <GridIcon width={16} height={16} />
            Medicine Inventory
          </Link>
          <Link
            href="/invoices"
            className={`nav-link ${pathname === "/invoices" ? "active" : ""}`}
            onClick={closeMenu}
          >
            <ChartIcon width={16} height={16} />
            Invoice & Revenue
          </Link>
        </nav>

        <button
          className="btn btn-ghost btn-icon theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          <SunIcon className="theme-icon theme-icon-dark" />
          <MoonIcon className="theme-icon theme-icon-light" />
        </button>

        <button
          className="btn btn-ghost btn-icon nav-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          title="Menu"
        >
          {menuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>
    </header>
  );
}

export function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn btn-ghost btn-icon" onClick={onClick} aria-label="Close">
      <XIcon />
    </button>
  );
}