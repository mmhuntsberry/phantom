import { desc } from "drizzle-orm";
import AdminReaderApplicants, {
  AdminApplicant,
} from "../../../../components/AdminReaderApplicants";
import AdminTokenSetter from "../../../../components/AdminTokenSetter";
import { db } from "../../../../db/index";
import { readerApplicants } from "../../../../db/schema";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

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
    status: applicant.status,
    approvedAt: applicant.approvedAt
      ? applicant.approvedAt.toISOString()
      : null,
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

      <AdminTokenSetter />
      <AdminReaderApplicants applicants={formatted} />
    </div>
  );
}
