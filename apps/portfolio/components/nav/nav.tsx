"use client";

import Link from "next/link";
import styles from "./nav.module.css";

type NavProps = {
  links: { href: string; label: string }[];
  pathname: string;
};

export default function Nav({ links, pathname }: NavProps) {
  return (
    <nav className={styles.nav}>
      {links.map((link) => (
        <Link
          className={link.href === pathname ? styles.active : styles.link}
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
