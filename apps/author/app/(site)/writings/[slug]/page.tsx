// apps/author/app/writings/[slug]/page.tsx

import { getWriting } from "../../../../sanity/sanity-utils";
import { notFound } from "next/navigation";
import WritingContent from "../../../../components/WritingContent.server";
import Link from "next/link";

import styles from "./page.module.css";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type Props = {
  params: { slug: string };
};

export default async function WritingPage({ params }: Props) {
  const post = await getWriting({ slug: params.slug });

  if (!post || post.series) return notFound(); // 🔒 only allow standalones

  return (
    <main>
      <Link href={`/`} className={`${styles.backLink}`}>
        <ArrowLeft size={20} />
        Back to Series
      </Link>
      <h1 className={styles.title}>{post.title}</h1>
      <div className="prose prose-lg">
        <WritingContent content={post.content} title={post.title} />
      </div>
    </main>
  );
}
