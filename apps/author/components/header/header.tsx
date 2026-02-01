"use client";

import Nav from "../nav/nav";
import styles from "./header.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className={`${styles.header}`}>
      <div className={styles.headerContainer}>
        <div className={styles.navAndName}>
          <Nav pathname={pathname ?? ""} />
          <p className={styles.name}>Matthew Huntsberry</p>
        </div>
        <div className={styles.iconContainer}>
          <Link
            className={styles.iconLink}
            href="https://www.instagram.com/matt_huntsberry/"
          >
            <InstagramLogo size={48} />
          </Link>
          <Link
            className={styles.iconLink}
            href="https://substack.com/@matthewhuntsberry"
          >
            <img src="/substack.png" alt="Substack" width={48} height={48} />
          </Link>
        </div>
      </div>
    </header>
  );
}
