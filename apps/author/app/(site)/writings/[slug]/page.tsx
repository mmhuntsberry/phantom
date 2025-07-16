// apps/author/app/writings/[slug]/page.tsx

import { getWriting } from "../../../../sanity/sanity-utils";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

import styles from "./page.module.css";

type Props = {
  params: { slug: string };
};

export default async function WritingPage({ params }: Props) {
  const post = await getWriting({ slug: params.slug });

  if (!post || post.series) return notFound(); // 🔒 only allow standalones

  return (
    <main>
      <h1 className={styles.title}>{post.title}</h1>
      <div className="prose prose-lg">
        <PortableText value={post.content} />
      </div>
    </main>
  );
}
