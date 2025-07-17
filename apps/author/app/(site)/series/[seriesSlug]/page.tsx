import { getSeriesWithEpisodes } from "../../../../sanity/sanity-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import styles from "./page.module.css";

export default async function SeriesPage({
  params,
}: {
  params: { seriesSlug?: string };
}) {
  if (!params.seriesSlug) return notFound();

  const series = await getSeriesWithEpisodes(params.seriesSlug);

  if (!series) return notFound();

  return (
    <div className={styles.container}>
      <section>
        <h1 className={styles.title}>{series.title}</h1>
        {series.media?.image?.asset?.url && (
          <div
            style={{
              display: "grid",
            }}
          >
            <div className={styles.imageContainer}>
              <Image
                src={series.media.image.asset.url}
                alt={series.media.image.alt || series.title}
                fill
                className={styles.image}
                priority
              />
            </div>
            {series.description && (
              <p className={styles.description}>{series.description}</p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Episode List</h2>
        <ul className="space-y-2">
          {series.episodes.map((ep) => (
            <li key={ep._id}>
              <Link
                href={`/series/${params.seriesSlug}/${ep.season}/${ep.episode}`}
                className={styles.link}
              >
                <span className={styles.season}>
                  S{String(ep.season).padStart(2, "0")}
                </span>
                <span className={styles.episode}>
                  E{String(ep.episode).padStart(2, "0")}:{" "}
                </span>
                <span className={styles.episodeTitle}>
                  {ep.episodeTitle || ep.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
