import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "sanity";
import styles from "./ManuscriptText.module.css";

type ManuscriptTextProps = {
  value: PortableTextBlock[];
};

const isSceneBreak = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    trimmed === "***" ||
    trimmed === "* * *" ||
    /^\*+\s*\*+\s*\*+$/.test(trimmed)
  );
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children, value }) => {
      const raw = (value as any)?.children?.[0]?.text || "";
      const shouldCenter = isSceneBreak(raw);

      return (
        <p
          className={`${styles.paragraph} ${
            shouldCenter ? styles.centered : ""
          }`}
        >
          {children}
        </p>
      );
    },
  },
};

export default function ManuscriptText({ value }: ManuscriptTextProps) {
  if (!value || value.length === 0) return null;

  return (
    <div className={styles.content}>
      <PortableText value={value} components={components} />
    </div>
  );
}
