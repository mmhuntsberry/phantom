import { getWritingsGrouped } from "../../sanity/sanity-utils";
import Link from "next/link";
import { Writing } from "../../types/Writing";
import styles from "./page.module.css";
import { Signpost } from "@phosphor-icons/react/dist/ssr";

export default async function HomePage() {
  const { standalone, seriesList } = await getWritingsGrouped();

  const grouped = standalone.reduce((acc, post) => {
    const key = post.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {} as Record<string, Writing[]>);

  // Groupings based on your categories and tags
  // const flashAndPoetry = writing?.filter((w) =>
  //   w.tags?.some((tag) =>
  //     ["flash-fiction", "poetry", "emotional horror"].includes(tag)
  //   )
  // );

  // const serialized = writing?.filter((w) =>
  //   w.tags?.some((tag) =>
  //     ["serialized", "flash-fiction", "poetry", "emotional horror"].includes(
  //       tag
  //     )
  //   )
  // );

  // const novels = writings.filter(
  //   (w) =>
  //     w.category === "novel" ||
  //     w.tags?.includes("novel") ||
  //     w.title.toLowerCase().includes("some people") // temporary fallback
  // );

  // const screenplays = writings.filter(
  //   (w) =>
  //     w.category === "screenplay" ||
  //     w.tags?.includes("pilot") ||
  //     w.title.toLowerCase().includes("oliver")
  // );

  return (
    <div>
      <h1 className={styles.title}>WORDS FOR THE OUTSIDERS</h1>

      {/* 1. Standalone Writings by Category */}
      {Object.entries(grouped).map(([category, posts]) => (
        <section className={styles.section} key={category}>
          <h2 className={styles.category}>{category.replace("-", " ")}</h2>
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post._id}>
                <Link href={`/writings/${post.slug}`}>
                  {post.title} <Signpost size={32} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* 2. Serialized Series Overview */}
      <section className={styles.section}>
        <h2 className={styles.category}>Series</h2>
        <ul className={styles.list}>
          {seriesList.map((series) => (
            <li className={styles.item} key={series.slug}>
              <Link className={styles.link} href={`/series/${series.slug}`}>
                {series.title}
                <Signpost size={32} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
