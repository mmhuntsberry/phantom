import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "sanity";
import styles from "./RichText.module.css";

type RichTextProps = {
  value: PortableTextBlock[];
};

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className={styles.heading}>{children}</h2>,
    h3: ({ children }) => <h3 className={styles.subheading}>{children}</h3>,
    normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className={styles.list}>{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => <li className={styles.listItem}>{children}</li>,
  },
};

export default function RichText({ value }: RichTextProps) {
  if (!value || value.length === 0) return null;

  return (
    <div className={styles.content}>
      <PortableText value={value} components={components} />
    </div>
  );
}
