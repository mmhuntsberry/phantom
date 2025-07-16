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
  if (!params.seriesSlug) return notFound(); // ✅ guard against undefined

  const series = await getSeriesWithEpisodes(params.seriesSlug);

  console.log(series);

  if (!series) return notFound();

  return (
    <>
      <header>
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
                // sizes="(max-width: 768px) 100vw, 320px"
                className={styles.image}
                priority
              />
            </div>
            {series.description && (
              <p className={styles.description}>{series.description}</p>
            )}
          </div>
        )}
      </header>

      <section>
        <h2 className="text-lg font-semibold">Episodes</h2>
        <ul className="space-y-2">
          {series.episodes.map((ep) => (
            <li key={ep._id}>
              <Link
                href={`/series/${params.seriesSlug}/${ep.season}/${ep.episode}`}
                className="hover:underline"
              >
                S{String(ep.season).padStart(2, "0")}E
                {String(ep.episode).padStart(2, "0")} —{" "}
                {ep.episodeTitle || ep.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
