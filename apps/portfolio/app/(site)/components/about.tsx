"use client";

import { usePathname } from "next/navigation";
import styles from "../layout.module.css";

export default function About() {
  const pathname = usePathname();
  return (
    pathname === "/" && (
      <>
        <p className={styles.about}>
          Hi, I'm Matt—an engineer, designer, educator, and design system
          specialist. Seamlessly bridging the gap between design and code.{" "}
          <strong>I create systems that create products.</strong>
        </p>
        <h1 className={styles.title}>
          {pathname === "/" ? "Featured Work" : "Resume"}
        </h1>
      </>
    )
  );
}
