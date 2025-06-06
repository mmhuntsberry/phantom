"use client";

import { usePathname } from "next/navigation";
import styles from "../layout.module.css";

export default function About() {
  const pathname = usePathname();
  return (
    pathname === "/" && (
      <>
        <p className={styles.about}>
          Hi. I'm Matt—an architect of scalable design platforms and system ops.
          I led the transformation of a 48-brand product ecosystem, rebuilding
          its design system from the ground up with token pipelines, Figma
          automation, and real-time design system analytics. I don’t just build
          components—
          <strong>I design how teams work at scale.</strong>
        </p>
        <h1 className={styles.title}>
          {pathname === "/" ? (
            <>
              <span style={{ fontStyle: "italic", fontSize: "1.225em" }}>
                i
              </span>
              mpact at scale
            </>
          ) : (
            <>
              <span style={{ fontStyle: "italic", fontSize: "1.225em" }}>
                Join the Misfits & Dreamers
              </span>
            </>
          )}
        </h1>
      </>
    )
  );
}
