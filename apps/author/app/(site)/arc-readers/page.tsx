import { Suspense } from "react";
import ReaderApplyForm from "../../../components/ReaderApplyForm";
import styles from "./page.module.css";

export const metadata = {
  title: "ARC Readers | Matthew Huntsberry",
  description: "Apply to join the ARC list for full-length review copies.",
};

export default function ArcReadersPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>ARC Readers</p>
        <h1 className={styles.title}>Apply for advance review copies</h1>
        <p className={styles.subtitle}>
          ARC readers get full drafts before release and provide feedback and
          reviews. Applications are reviewed manually.
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
          <p className={styles.bodyText}>4-6 hours for a full ARC draft.</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Apply</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <ReaderApplyForm cohortType="arc" program="arc_full_v1" />
        </Suspense>
      </section>
    </div>
  );
}
