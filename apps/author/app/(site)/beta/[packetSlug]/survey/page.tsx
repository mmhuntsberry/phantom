import { notFound } from "next/navigation";
import { getBetaPacketBySlug } from "../../../../../sanity/sanity-utils";
import BetaSurveyForm from "../../../../../components/BetaSurveyForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Beta Survey | Matthew Huntsberry",
  description: "Quick feedback survey for beta readers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BetaSurveyPage({
  params,
}: {
  params: { packetSlug: string };
}) {
  const packet = await getBetaPacketBySlug(params.packetSlug);
  if (!packet) return notFound();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Survey</p>
        <h1 className={styles.title}>2-minute feedback</h1>
        <p className={styles.subtitle}>
          Thanks for reading {packet.book?.title || "the draft"}. Your notes help
          tighten the story.
        </p>
      </section>

      <section className={styles.section}>
        <BetaSurveyForm packetId={packet._id} />
      </section>

      <section className={styles.section}>
        <p className={styles.footerNote}>
          Want the full manuscript later? Stay on the list and you'll hear about
          the next round.
        </p>
      </section>
    </div>
  );
}
