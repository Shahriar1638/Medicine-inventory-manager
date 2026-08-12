"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { CartIcon, ChartIcon, HomeIcon, MoonIcon, SunIcon, XIcon } from "@/components/icons";

export default function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme, cartCount, setCartOpen } = useStore();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" />
              <path d="M7.5 15h9" />
            </svg>
          </span>
          <span>
            <span className="brand-name">Medix</span>
            <br />
            <span className="brand-sub">Pharmacy POS</span>
          </span>
        </Link>

        <nav className="nav">
          <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
            <HomeIcon width={16} height={16} />
            POS Counter
          </Link>
          <Link
            href="/invoices"
            className={`nav-link ${pathname === "/invoices" ? "active" : ""}`}
          >
            <ChartIcon width={16} height={16} />
            Invoices
          </Link>
        </nav>

        <div className="spacer" />

        <button
          className="btn btn-ghost btn-icon"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <button className="btn btn-secondary" onClick={() => setCartOpen(true)}>
          <CartIcon width={16} height={16} />
          Cart
          {cartCount > 0 && <span className="badge-count">{cartCount}</span>}
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