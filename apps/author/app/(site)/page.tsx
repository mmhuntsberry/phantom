import Image from "next/image";
import Link from "next/link";
import { getFeaturedBook, getStartHerePage } from "../../sanity/sanity-utils";
import SubscribeForm from "../../components/SubscribeForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Start Here | Matthew Huntsberry",
  description:
    "New here? Start with a best-of story, a flagship serial, or the coming novel.",
};

const getEntryHref = (entry: {
  customHref?: string;
  link?: { _type?: string; slug?: string };
}) => {
  if (entry.customHref) return entry.customHref;
  if (!entry.link?.slug) return "#";

  switch (entry.link._type) {
    case "writing":
      return `/writings/${entry.link.slug}`;
    case "series":
      return `/series/${entry.link.slug}`;
    case "book":
      return `/books/${entry.link.slug}`;
    default:
      return "#";
  }
};

export default async function StartHerePage() {
  const page = await getStartHerePage();
  const featuredBook = await getFeaturedBook();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Start Here</h1>
        <p className={styles.promise}>
          {page?.brandPromise || (
            <>
              If you're new here, start with a{" "}
              <Link href="/stories" className={styles.inlineLink}>
                short story
              </Link>{" "}
              - or{" "}
              <Link href="/stories" className={styles.inlineLink}>
                pick a series
              </Link>{" "}
              and read from the beginning.
            </>
          )}
        </p>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.grid}>
          {featuredBook && featuredBook.slug && (
            <article
              className={`${styles.card} ${styles.featuredCard}`}
              key={featuredBook._id}
            >
              <div className={styles.featuredMedia}>
                <p className={styles.cardKicker}>Featured book</p>
                <div className={styles.cardMedia}>
                  {featuredBook.cover?.asset?.url ? (
                    <Image
                      src={featuredBook.cover.asset.url}
                      alt={featuredBook.cover.alt || featuredBook.title}
                      fill
                      className={styles.cardImage}
                    />
                  ) : (
                    <div
                      className={styles.coverPlaceholder}
                      role="img"
                      aria-label={`${featuredBook.title} cover placeholder`}
                    >
                      <span className={styles.coverPlaceholderText}>
                        Cover in progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.featuredContent}>
                <h2 className={styles.cardTitle}>{featuredBook.title}</h2>
                {(featuredBook.shortPitch || featuredBook.tagline) && (
                  <p className={styles.cardDescription}>
                    {featuredBook.shortPitch || featuredBook.tagline}
                  </p>
                )}
                <Link
                  className={styles.cardLink}
                  href={`/books/${featuredBook.slug}`}
                >
                  See the book
                </Link>
              </div>
            </article>
          )}
          {(page?.entryPoints || []).map((entry) => {
            const href = getEntryHref(entry);
            return (
              <article className={styles.card} key={entry.title}>
                <h2 className={styles.cardTitle}>{entry.title}</h2>
                {entry.description && (
                  <p className={styles.cardDescription}>{entry.description}</p>
                )}
                <Link className={styles.cardLink} href={href}>
                  {entry.ctaLabel || "Read now"}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      {page?.expectations && page.expectations.length > 0 && (
        <section className={styles.expectations}>
          <h2 className={styles.sectionTitle}>What to expect</h2>
          <ul className={styles.list}>
            {page.expectations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.subscribe}>
        <h2 className={styles.sectionTitle}>Stay close to the work</h2>
        <p className={styles.sectionIntro}>
          Fresh work, early chapters, and a few notes from the writing desk.
        </p>
        <SubscribeForm />
      </section>
    </div>
  );
}
