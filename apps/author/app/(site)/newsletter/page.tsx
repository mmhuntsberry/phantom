import { getNewsletterPage } from "../../../sanity/sanity-utils";
import SubscribeForm from "../../../components/SubscribeForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Newsletter | Matthew Huntsberry",
  description:
    "Occasional updates: new stories, excerpts, and release news.",
};

export default async function NewsletterPage() {
  const page = await getNewsletterPage();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{page?.title || "Newsletter"}</h1>
        <p className={styles.subtitle}>
          {page?.intro ||
            "Occasional updates: new stories, excerpts, and release news."}
        </p>
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.valueProps}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}>What you'll get</h2>
            <ul className={styles.list}>
              {(page?.valueProps || [
                "First looks at new fiction",
                "Draft excerpts and research notes",
                "Book and serial updates",
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
    </div>
  );
}
