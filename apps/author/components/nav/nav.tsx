"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react/dist/ssr";
import styles from "./nav.module.css";
import { useRouter } from "next/navigation";

export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Start Here" },
  { href: "/stories", label: "Stories" },
  { href: "/poems", label: "Poems" },
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/newsletter", label: "Newsletter" },
];

export type NavProps = {
  pathname: string;
};

export default function Nav({ pathname }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setAdminAuthed(Boolean(data?.authed));
      })
      .catch(() => null);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const authLinks: NavLink[] = adminAuthed
    ? [{ href: "/admin/reader-applicants", label: "Admin" }]
    : [{ href: "/admin/login", label: "Sign in" }];

  const allLinks = [...navLinks, ...authLinks];

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAdminAuthed(false);
    setIsOpen(false);
    router.refresh();
  }

  return (
    <nav className={styles.nav} aria-label="Primary">
      <button
        className={styles.menuButton}
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? <X size={32} /> : <List size={32} />}
      </button>

      <div className={styles.links}>
        {allLinks.map((link: NavLink) => (
          <Link
            className={`${styles.link} ${
              link.href === "/"
                ? pathname === "/"
                  ? styles.active
                  : ""
                : pathname.startsWith(link.href)
                ? styles.active
                : ""
            }`}
            href={link.href}
            key={link.href}
            prefetch
          >
            {link.label}
          </Link>
        ))}
        {adminAuthed && (
          <button
            type="button"
            className={`${styles.link} ${styles.buttonLink}`}
            onClick={signOut}
          >
            Sign out
          </button>
        )}
      </div>

      <div
        id="mobile-nav"
        className={`${styles.mobilePanel} ${
          isOpen ? styles.mobilePanelOpen : ""
        }`}
      >
        <div className={styles.mobileLinks}>
          {allLinks.map((link: NavLink) => (
            <Link
              className={`${styles.mobileLink} ${
                link.href === "/"
                  ? pathname === "/"
                    ? styles.active
                    : ""
                  : pathname.startsWith(link.href)
                  ? styles.active
                  : ""
              }`}
              href={link.href}
              key={link.href}
              prefetch
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {adminAuthed && (
            <button
              type="button"
              className={styles.mobileLink}
              onClick={signOut}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
