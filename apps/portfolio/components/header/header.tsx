"use client";

import Logo from "../logo/logo";
import Nav from "../nav/nav";
import styles from "./header.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className={`${styles.header}`}>
      <div className={styles.headerContainer}>
        <Nav pathname={pathname ?? ""} />
        <Link href="/">
          <Logo />
        </Link>
      </div>
    </header>
  );
}
