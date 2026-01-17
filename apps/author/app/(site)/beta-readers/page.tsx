import { Suspense } from "react";
import Link from "next/link";
import ReaderApplyForm from "../../../components/ReaderApplyForm";
import RichText from "../../../components/RichText";
import { getBooksInBeta } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";

export const metadata = {
  title: "Beta Readers | Matthew Huntsberry",
  description: "Apply to join the beta reader list for early chapters.",
};

// Force dynamic rendering to get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BetaReadersPage() {
  const booksInBeta = await getBooksInBeta();
  
  // Debug logging
  console.log("📚 Beta readers page - books found:", booksInBeta.length);

  // If only one book in beta, redirect to book-specific page
  if (booksInBeta.length === 1) {
    return (
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Beta Readers</h1>
          <p className={styles.subtitle}>
            A small group reads early chapters of{" "}
            <strong>{booksInBeta[0].title}</strong> and shares what works and
            what doesn't. Applications are reviewed manually.
          </p>
        </section>

        <section className={styles.details}>
          <div className={styles.detailCard}>
            <h2 className={styles.sectionTitle}>What to expect</h2>
            {booksInBeta[0].contentNotes &&
            booksInBeta[0].contentNotes.length > 0 ? (
              <div className={styles.contentNotes}>
                <RichText value={booksInBeta[0].contentNotes} />
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
              bookId={booksInBeta[0]._id}
            />
          </Suspense>
        </section>
      </div>
    );
  }

  // If multiple books, show selector
  if (booksInBeta.length > 1) {
    return (
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Beta Readers</h1>
          <p className={styles.subtitle}>
            A small group reads early chapters and shares what works and what
            doesn't. Applications are reviewed manually.
          </p>
        </section>

        <section className={styles.bookSelection}>
          <h2 className={styles.sectionTitle}>Which book are you applying for?</h2>
          <div className={styles.bookList}>
            {booksInBeta.map((book) => (
              <Link
                key={book._id}
                href={`/beta-readers/${book.slug}`}
                className={styles.bookCard}
              >
                <h3 className={styles.bookTitle}>{book.title}</h3>
                {book.tagline && (
                  <p className={styles.bookTagline}>{book.tagline}</p>
                )}
                {book.shortPitch && (
                  <p className={styles.bookPitch}>{book.shortPitch}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // If no books in beta, show general form
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Beta Readers</h1>
        <p className={styles.subtitle}>
          A small group reads early chapters and shares what works and what
          doesn't. Applications are reviewed manually.
        </p>
      </section>

      <section className={styles.details}>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>What to expect</h2>
          <p className={styles.bodyText}>
            Content notes will be available when you select a book.
          </p>
        </div>
        <div className={styles.detailCard}>
          <h2 className={styles.sectionTitle}>Time commitment</h2>
          <p className={styles.bodyText}>30-45 minutes for chapters 1-3.</p>
        </div>
      </section>

      <section className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Join the beta group</h2>
        <Suspense fallback={<div>Loading form...</div>}>
          <ReaderApplyForm cohortType="beta" program="beta_partial_v1" />
        </Suspense>
      </section>
    </div>
  );
}
