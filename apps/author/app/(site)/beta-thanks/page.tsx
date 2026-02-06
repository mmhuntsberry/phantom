import Link from "next/link";
import { getActiveBetaPacket } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";

export const metadata = {
  title: "Beta Access | Matthew Huntsberry",
  description: "Beta access details and next steps.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BetaThanksPage() {
  const packet = await getActiveBetaPacket();
  const packetHref = packet ? `/beta/${packet.slug}` : "/beta-readers";
  const surveyHref = packet ? `/beta/${packet.slug}/survey` : "/beta-readers";

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>You're in</h1>
        <p className={styles.subtitle}>
          Here's your private link. Please don't share it publicly.
        </p>
      </section>

      <section className={styles.actions}>
        <Link className={styles.cta} href={packetHref}>
          Read chapters 1-3
        </Link>
        <Link className={styles.secondary} href={surveyHref}>
          Take the 2-minute survey
        </Link>
      </section>
    </div>
  );
}
