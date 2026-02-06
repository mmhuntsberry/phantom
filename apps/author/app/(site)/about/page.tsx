import Image from "next/image";
import { getAboutPage } from "../../../sanity/sanity-utils";
import SubscribeForm from "../../../components/SubscribeForm";
import RichText from "../../../components/RichText";
import styles from "./page.module.css";

export const metadata = {
  title: "About | Matthew Huntsberry",
  description: "About the author and the work behind the stories.",
};

export default async function AboutPage() {
  const page = await getAboutPage();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>{page?.title || "About"}</h1>
      </section>

      <section className={styles.bodySection}>
        {page?.photo?.asset?.url && (
          <div className={styles.photoWrap}>
            <div className={styles.photo}>
              <Image
                src={page.photo.asset.url}
                alt={page.photo.alt || "Author photo"}
                fill
                className={styles.photoImage}
              />
            </div>
          </div>
        )}
        {page?.body ? (
          <RichText value={page.body} />
        ) : (
          <p className={styles.placeholder}>
            A quick note about the work and the writer will land here soon.
          </p>
        )}
      </section>

      <section className={styles.subscribe}>
        <h2 className={styles.sectionTitle}>Stay in the loop</h2>
        <p className={styles.sectionIntro}>
          New releases, early chapters, and what's next.
        </p>
        <SubscribeForm />
      </section>
    </div>
  );
}
