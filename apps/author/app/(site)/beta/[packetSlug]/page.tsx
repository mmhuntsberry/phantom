import Link from "next/link";
import { notFound } from "next/navigation";
import { getBetaPacketBySlug } from "../../../../sanity/sanity-utils";
import RichText from "../../../../components/RichText";
import styles from "./page.module.css";

export const metadata = {
  title: "Beta Packet | Matthew Huntsberry",
  description: "Private beta packet for early readers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BetaPacketPage({
  params,
}: {
  params: { packetSlug: string };
}) {
  const packet = await getBetaPacketBySlug(params.packetSlug);
  if (!packet) return notFound();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Beta Packet</p>
        <h1 className={styles.title}>{packet.title}</h1>
        {packet.summary && <p className={styles.subtitle}>{packet.summary}</p>}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Chapters 1-3</h2>
        <RichText value={packet.chapters} />
      </section>

      {(packet.files?.epub || packet.files?.pdf) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Downloads</h2>
          <div className={styles.actions}>
            {packet.files.epub && (
              <Link className={styles.cta} href={packet.files.epub}>
                Download EPUB
              </Link>
            )}
            {packet.files.pdf && (
              <Link className={styles.cta} href={packet.files.pdf}>
                Download PDF
              </Link>
            )}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <Link className={styles.bigCta} href={`/beta/${packet.slug}/survey`}>
          {packet.surveyCta || "Submit 2-minute feedback"}
        </Link>
      </section>
    </div>
  );
}
