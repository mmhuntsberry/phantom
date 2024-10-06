"use client";

import Logo from "../logo/logo";
import Nav from "../nav/nav";
import styles from "./header.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className={`${styles.header} container`}>
      <Link href="/">
        <Logo />
      </Link>
      <Nav pathname={pathname ?? ""} />
    </header>
  );
}
