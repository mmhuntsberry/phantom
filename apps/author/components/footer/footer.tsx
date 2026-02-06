"use client";

import Logo from "../logo/logo";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import styles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={`${styles.footer}`}>
      <span className={styles.timestamp}>
        © {new Date().getFullYear()} Matthew Huntsberry. <br /> All Rights
        Reserved.
      </span>

      <div className={styles.icon}>
        <Link href="https://www.instagram.com/matt_huntsberry/">
          <InstagramLogo size={48} />
        </Link>
      </div>
    </footer>
  );
}
