"use client";

import Logo from "../logo/logo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import styles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={`${styles.footer} container`}>
      <div className={styles.logo}>
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className={styles.icon}>
        <Link href="https:s//www.instagram.com/matt_huntsberry/">
          <InstagramLogo size={64} />
        </Link>
      </div>
    </footer>
  );
}
