import { Suspense } from "react";
import { notFound } from "next/navigation";
import ReaderApplyForm from "../../../../components/ReaderApplyForm";
import RichText from "../../../../components/RichText";
import { getBook } from "../../../../sanity/sanity-utils";
import styles from "../page.module.css";

export async function generateMetadata({
  params,
}: {
  params: { bookSlug: string };
}) {
  const book = await getBook(params.bookSlug);
  if (!book) {
    return {
      title: "Beta Readers | Matthew Huntsberry",
      description: "Apply to join the beta reader list for early chapters.",
    };
  }
  return {
    title: `Beta Readers - ${book.title} | Matthew Huntsberry`,
    description: `Apply to read early chapters of ${book.title}.`,
  };
}

export default async function BetaReadersBookPage({
  params,
}: {
  params: { bookSlug: string };
}) {
  const book = await getBook(params.bookSlug);

  if (!book || book.status !== "comingSoon") {
    notFound();
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Beta Readers</h1>
        <p className={styles.subtitle}>
          A small group reads early chapters of <strong>{book.title}</strong>{" "}
          and shares what works and what doesn't. Applications are reviewed
          manually.
        </p>
      </section>

      <section className={styles.details}>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>What to expect</h2>
          {book.contentNotes && book.contentNotes.length > 0 ? (
            <div className={styles.contentNotes}>
              <RichText value={book.contentNotes} />
            </div>
          ) : (
            <p className={styles.bodyText}>
              Content notes will be available soon.
            </p>
          )}
        </div>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>Time commitment</h2>
          <p className={styles.bodyText}>30-45 minutes for chapters 1-3.</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Join the beta group</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <ReaderApplyForm
            cohortType="beta"
            program="beta_partial_v1"
            bookId={book._id}
          />
        </Suspense>
      </section>
    </div>
  );
}
