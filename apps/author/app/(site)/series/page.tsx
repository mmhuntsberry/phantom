import { getWritingsGrouped } from "../../../sanity/sanity-utils";
import Link from "next/link";
import styles from "./page.module.css";
import { Signpost } from "@phosphor-icons/react/dist/ssr";

export default async function SeriesIndexPage() {
  const { seriesList } = await getWritingsGrouped();

  return (
    <div>
      <h1 className={styles.title}>Series</h1>

      <section className={styles.section}>
        <ul>
          {seriesList.map((series) => (
            <li key={series.slug}>
              <Link className={styles.link} href={`/series/${series.slug}`}>
                {series.title} <Signpost size={32} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

