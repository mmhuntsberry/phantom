import Link from "next/link";
import { getPoems } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";
import { Signpost } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Poems | Matthew Huntsberry",
  description: "Poems and fragments from Matthew Huntsberry.",
};

export default async function PoemsPage() {
  const poems = await getPoems();

  return (
    <div>
      <h1 className={styles.title}>Poems</h1>
      <p className={styles.subtitle}>Poems and fragments.</p>

      <section className={styles.section}>
        <h2 className={styles.category}>Poems</h2>
        <ul className={styles.list}>
          {poems.map((poem) => (
            <li className={styles.item} key={poem._id}>
              <Link className={styles.link} href={`/poems/${poem.slug}`}>
                {poem.title} <Signpost size={32} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
