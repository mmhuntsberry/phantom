import { getWriting } from "../../../../../../sanity/sanity-utils";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

import WritingContent from "../../../../../../components/WritingContent.server";

import { format } from "date-fns";

export default async function EpisodePage({
  params,
}: {
  params: {
    seriesSlug: string;
    season: string;
    episode: string;
    date: string;
  };
}) {
  const post = await getWriting({
    seriesSlug: params.seriesSlug,
    season: params.season,
    episode: params.episode,
  });

  if (!post) return notFound();

  const createdAt = format(new Date(post._createdAt), "MMMM d, yyyy");

  if (!post) return notFound();

  console.log({ params });

  return (
    <main className="max-w-2xl mx-auto px-6 py-20">
      <h1 className={styles.title}>{post.title}</h1>
      {post.season && (
        <h2 className={styles.episode}>
          S{post.season}: EP {post.episode}
        </h2>
      )}

      {post.episodeTitle && (
        <h2 className={styles.episodeTitle}>{post.episodeTitle}</h2>
      )}
      <p className={styles.date}>Published on {createdAt}</p>
      <div className="prose prose-lg mt-4xl">
        <WritingContent title={post.title} content={post.content} />
      </div>
    </main>
  );
}
