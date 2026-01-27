"use client";

import Link from "next/link";
import styles from "./nav.module.css";

export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Work" },
  { href: "/resume", label: "Resume" },
];

export type NavProps = {
  pathname: string;
};

export default function Nav({ pathname }: NavProps) {
  return (
    <nav className={styles.nav}>
      {navLinks.map((link: NavLink) => (
        <Link
          className={
            link.href === pathname
              ? `control control--active ${styles.link}`
              : `control ${styles.link}`
          }
          href={link.href}
          key={link.href}
          prefetch
          aria-current={link.href === pathname ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
