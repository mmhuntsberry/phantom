"use client";

import Logo from "../logo/logo";
import Nav from "../nav/nav";
import styles from "./header.module.css";
import type { NavLink } from "../../app/(site)/layout";
import { usePathname } from "next/navigation";
import Link from "next/link";

type HeaderProps = {
  navLinks: NavLink[];
  // pathname?: string;
};

export default function Header({ navLinks }: HeaderProps) {
  const pathname = usePathname();
  return (
    <header className={`${styles.header} container`}>
      <Link href="/">
        <Logo />
      </Link>
      <Nav links={navLinks} pathname={pathname ?? ""} />
    </header>
  );
}
