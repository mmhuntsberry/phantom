import Link from "next/link";
import { getStartHerePage } from "../../../sanity/sanity-utils";
import SubscribeForm from "../../../components/SubscribeForm";
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

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Start Here</p>
        <h1 className={styles.title}>Start Here</h1>
        <p className={styles.promise}>
          {page?.brandPromise || "Words for outsiders, wanderers, and the strange."}
        </p>
      </section>

      <section className={styles.gridSection}>
        <div className={styles.grid}>
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
          New stories, early chapters, and the occasional note from the edge.
        </p>
        <SubscribeForm />
      </section>
    </div>
  );
}
