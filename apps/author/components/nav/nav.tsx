"use client";

import Link from "next/link";
import styles from "./nav.module.css";

export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Stories" },
  { href: "/subscribe", label: "Subscribe" },
];

export type NavProps = {
  pathname: string;
};

export default function Nav({ pathname }: NavProps) {
  return (
    <nav className={styles.nav}>
      {navLinks.map((link: NavLink) => (
        <Link
          className={`${styles.link} ${
            link.href === pathname ? styles.active : ""
          }`}
          href={link.href}
          key={link.href}
          prefetch
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
