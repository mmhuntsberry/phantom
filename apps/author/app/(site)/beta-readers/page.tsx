import { Suspense } from "react";
import ReaderApplyForm from "../../../components/ReaderApplyForm";
import styles from "./page.module.css";

export const metadata = {
  title: "Beta Readers | Matthew Huntsberry",
  description: "Apply to join the beta reader list for early chapters.",
};

export default function BetaReadersPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Beta Readers</p>
        <h1 className={styles.title}>Apply to read early chapters</h1>
        <p className={styles.subtitle}>
          A small group reads early drafts and calls out what lands and what does
          not. Applications are reviewed manually.
        </p>
      </section>

      <section className={styles.details}>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>Content notes</h2>
          <p className={styles.bodyText}>
            Emotional horror, grief, and references to childhood trauma.
          </p>
        </div>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>Time estimate</h2>
          <p className={styles.bodyText}>30-45 minutes for chapters 1-3.</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Apply</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <ReaderApplyForm cohortType="beta" program="beta_partial_v1" />
        </Suspense>
      </section>
    </div>
  );
}
