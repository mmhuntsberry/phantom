import { desc } from "drizzle-orm";
import AdminReaderApplicants, {
  AdminApplicant,
} from "../../../../components/AdminReaderApplicants";
import { db } from "../../../../db/index";
import { readerApplicants } from "../../../../db/schema";
import styles from "./page.module.css";

export const metadata = {
  title: "Reader Applicants | Admin",
  description: "Review and approve reader applicants.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderApplicantsPage() {
  const applicants = await db
    .select()
    .from(readerApplicants)
    .orderBy(desc(readerApplicants.createdAt));

  const formatted: AdminApplicant[] = applicants.map((applicant) => ({
    id: applicant.id,
    email: applicant.email,
    cohortType: applicant.cohortType,
    program: applicant.program,
    formatPref: applicant.formatPref,
    contentNotesAck: applicant.contentNotesAck,
    tasteProfile: applicant.tasteProfile,
    source: applicant.source,
    createdAt: applicant.createdAt.toISOString(),
  }));

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Reader applicants</h1>
        <p className={styles.subtitle}>
          Approve readers and generate private access links.
        </p>
      </section>

      <AdminReaderApplicants applicants={formatted} />
    </div>
  );
}
