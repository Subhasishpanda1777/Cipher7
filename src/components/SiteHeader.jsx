"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/knowledge-hub", label: "Knowledge Hub" },
  { href: "/screening/instructions", label: "Screening" },
  { href: "/therapy", label: "Therapy" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = NAV_LINKS;

  const dashboardHref = user?.role === "doctor" || user?.role === "admin" ? "/doctor" : "/parent";

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="site-header__brand" onClick={closeMenu}>
          <div className="site-header__logo">
            <Image
              src="/assets/visionai-logo.svg"
              alt="VisionAI – Smart Amblyopia Screening & Therapy"
              width={200}
              height={70}
              priority
            />
          </div>
        </Link>

        <div className="site-header__navWrap">
          <nav className="site-header__nav" aria-label="Primary">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`site-header__navLink ${active ? "site-header__navLink--active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="site-header__actions">
          {status === "loading" && <span className="site-header__loading" aria-live="polite">Checking session…</span>}
          {status === "authenticated" && user ? (
            <>
              <span className="site-header__pill" role="status">
                {user.firstName}
                <span className="site-header__pillDot" />
                {user.role}
              </span>
              <button type="button" onClick={handleLogout} className="outline-button">
                Logout
              </button>
              <Link href={user.role === "parent" ? "/parent" : "/doctor"} className="cta-button">
                Dashboard
              </Link>
            </>
          ) : null}

          {status === "unauthenticated" && (
            <>
              <Link href="/auth/login" className="outline-button">
                Login
              </Link>
              <Link href="/auth/register" className="cta-button">
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className={`site-header__menuToggle ${isMenuOpen ? "is-open" : ""}`}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`site-header__mobile ${isMenuOpen ? "is-open" : ""}`}>
        <nav className="site-header__mobileNav" aria-label="Mobile primary">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`site-header__mobileLink ${active ? "site-header__mobileLink--active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="site-header__mobileActions">
          {status === "authenticated" && user ? (
            <>
              <span className="site-header__mobileUser">Signed in as {user.firstName}</span>
              <Link
                href={user.role === "parent" ? "/parent" : "/doctor"}
                className="cta-button"
                onClick={closeMenu}
              >
                Go to dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="outline-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="outline-button" onClick={closeMenu}>
                Login
              </Link>
              <Link href="/auth/register" className="cta-button" onClick={closeMenu}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
