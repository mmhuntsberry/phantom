import { desc, eq } from "drizzle-orm";
import AdminReaderApplicants, {
  AdminApplicant,
} from "../../../../components/AdminReaderApplicants";
import { db } from "@/db/index";
import { readerApplicants, readerInvites } from "@/db/schema";
import { getBookById } from "../../../../sanity/sanity-utils";
import AdminSectionNav from "../../../../components/AdminSectionNav";
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

  // Fetch book information and invite tokens for applicants
  const formatted: AdminApplicant[] = await Promise.all(
    applicants.map(async (applicant) => {
      let bookTitle: string | null = null;
      if (applicant.bookId) {
        const book = await getBookById(applicant.bookId);
        bookTitle = book?.title || null;
      }

      // Get invite token if applicant is approved
      let inviteToken: string | null = null;
      if (applicant.inviteId) {
        const invite = await db
          .select()
          .from(readerInvites)
          .where(eq(readerInvites.id, applicant.inviteId))
          .limit(1)
          .then((rows) => rows[0]);
        inviteToken = invite?.token || null;
      }

      return {
        id: applicant.id,
        email: applicant.email,
        cohortType: applicant.cohortType,
        program: applicant.program,
        formatPref: applicant.formatPref,
        contentNotesAck: applicant.contentNotesAck,
        tasteProfile: applicant.tasteProfile,
        source: applicant.source,
        bookId: applicant.bookId || null,
        bookTitle,
        status: applicant.status,
        approvedAt: applicant.approvedAt
          ? applicant.approvedAt.toISOString()
          : null,
        createdAt: applicant.createdAt.toISOString(),
        inviteToken,
      };
    })
  );

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Reader applicants</h1>
        <p className={styles.subtitle}>
          Approve readers and generate private access links.
        </p>
      </section>

      <AdminSectionNav />
      <AdminReaderApplicants applicants={formatted} />
    </div>
  );
}
