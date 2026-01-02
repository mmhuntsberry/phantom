import { getNewsletterPage } from "../../../sanity/sanity-utils";
import SubscribeForm from "../../../components/SubscribeForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Newsletter | Matthew Huntsberry",
  description:
    "Stories, drafts, and notes from the edge. A low-noise newsletter for readers.",
};

export default async function NewsletterPage() {
  const page = await getNewsletterPage();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Newsletter</p>
        <h1 className={styles.title}>{page?.title || "Newsletter"}</h1>
        <p className={styles.subtitle}>
          {page?.intro ||
            "A low-noise dispatch of new work, early chapters, and notes in progress."}
        </p>
      </section>

      <section className={styles.valueProps}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>What you'll get</h2>
          <ul className={styles.list}>
            {(page?.valueProps || [
              "Early access to new fiction",
              "Behind-the-scenes drafts and research",
              "Release updates for books and serials",
            ]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Frequency</h2>
          <p className={styles.cardText}>
            {page?.frequency || "Usually monthly, with the occasional extra note."}
          </p>
          <p className={styles.cardText}>
            {page?.privacyNote || "No spam. Unsubscribe anytime."}
          </p>
          {page?.leadMagnet && (
            <div className={styles.leadMagnet}>{page.leadMagnet}</div>
          )}
        </div>
      </section>

      <section className={styles.subscribe}>
        <h2 className={styles.sectionTitle}>Join the list</h2>
        <SubscribeForm buttonLabel="Subscribe" />
      </section>
    </div>
  );
}
