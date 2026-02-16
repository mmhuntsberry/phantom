import { getWritingsGrouped } from "../../../sanity/sanity-utils";
import Link from "next/link";
import { Writing } from "../../../types/Writing";
import styles from "./page.module.css";
import { Signpost } from "@phosphor-icons/react/dist/ssr";

export default async function WritingsIndexPage() {
  const { standalone } = await getWritingsGrouped();

  const grouped = standalone.reduce((acc, post) => {
    const key = post.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {} as Record<string, Writing[]>);

  return (
    <div>
      <h1 className={styles.title}>Writings</h1>

      {Object.entries(grouped).map(([category, posts]) => (
        <section className={styles.section} key={category}>
          <h2 className={styles.category}>{category.replace("-", " ")}</h2>
          <ul>
            {posts.map((post) => (
              <li className={styles.item} key={post._id}>
                <Link className={styles.link} href={`/writings/${post.slug}`}>
                  {post.title} <Signpost size={32} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

