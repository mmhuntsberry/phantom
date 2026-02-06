import { getPoem } from "../../../../sanity/sanity-utils";
import { notFound } from "next/navigation";
import WritingContent from "../../../../components/WritingContent.server";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

type Props = {
  params: { slug: string };
};

export default async function PoemPage({ params }: Props) {
  const poem = await getPoem(params.slug);

  if (!poem) return notFound();

  return (
    <main>
      <Link href="/poems" className={styles.backLink}>
        <ArrowLeft size={20} />
        Back to Poems
      </Link>
      <h1 className={styles.title}>{poem.title}</h1>
      <div className={`${styles.poem} prose prose-lg`}>
        <WritingContent content={poem.content} title={poem.title} />
      </div>
    </main>
  );
}
