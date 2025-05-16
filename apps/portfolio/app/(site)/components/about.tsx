"use client";

import { usePathname } from "next/navigation";
import styles from "../layout.module.css";

export default function About() {
  const pathname = usePathname();
  return (
    pathname === "/" && (
      <>
        <p className={styles.about}>
          <strong>I lead systems work at scale.</strong> Turning fragmented UI
          kits into operational platforms. From design tokens to Figma
          automation to adoption analytics,{" "}
          <strong>
            I create systems that enable organizations to ship faster and
            smarter.
          </strong>
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
            "Resume"
          )}
        </h1>
      </>
    )
  );
}
