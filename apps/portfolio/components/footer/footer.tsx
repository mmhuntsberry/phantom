"use client";

import Logo from "../logo/logo";
import { EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import styles from "./footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <p className={styles.tagline}>
            Design systems, tokens, and automation that scale.
          </p>
        </div>

        <div className={styles.links} aria-label="Links">
          <Link className={`control ${styles.iconLink}`} href="mailto:mmhuntsberry@gmail.com">
            <EnvelopeSimple size={24} />
            <span>Email</span>
          </Link>
          <Link
            className={`control ${styles.iconLink}`}
            href="https://www.linkedin.com/in/mmhuntsberry/"
          >
            <LinkedinLogo size={24} />
            <span>LinkedIn</span>
          </Link>
          <Link className={`control ${styles.iconLink}`} href="https://github.com/mmhuntsberry">
            <GithubLogo size={24} />
            <span>GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
