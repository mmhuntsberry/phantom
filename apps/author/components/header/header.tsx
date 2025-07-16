"use client";

import Logo from "../logo/logo";
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
        <Nav pathname={pathname ?? ""} />
        <Link href="/">
          <Logo />
        </Link>
        <div
          style={{
            marginBlockStart: "var(--space-md)",
            marginBlockEnd: "var(--space-xl)",
            display: "flex",
          }}
        >
          <Link
            className={styles.iconLink}
            href="https:s//www.instagram.com/matt_huntsberry/"
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
