"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSectionNav.module.css";

const links = [
  { href: "/admin/reader-applicants", label: "Applicants" },
  { href: "/admin/reader-metrics", label: "Reader metrics" },
  { href: "/admin/subscribers", label: "Subscribers" },
];

export default function AdminSectionNav() {
  const pathname = usePathname() || "";

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label="Admin sections">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${active ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          );
        })}

      </nav>
    </div>
  );
}
