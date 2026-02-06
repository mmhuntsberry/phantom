import Image from "next/image";
import Link from "next/link";
import { getBooks } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";

export const metadata = {
  title: "Books | Matthew Huntsberry",
  description: "Books and novellas from Matthew Huntsberry, including coming-soon releases.",
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Books</h1>
        <p className={styles.subtitle}>
          Long-form work across genres, from early drafts to release.
        </p>
      </section>

      <section className={styles.grid}>
        {books.length === 0 ? (
          <p className={styles.empty}>New books are on the way.</p>
        ) : (
          books.map((book) => (
            <article className={styles.card} key={book._id}>
              <div className={styles.cover}>
                {book.cover?.asset?.url ? (
                  <Image
                    src={book.cover.asset.url}
                    alt={book.cover.alt || book.title}
                    fill
                    className={styles.coverImage}
                  />
                ) : (
                  <div
                    className={styles.coverPlaceholder}
                    role="img"
                    aria-label={`${book.title} cover placeholder`}
                  >
                    <span className={styles.coverPlaceholderText}>
                      Cover in progress
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>{book.title}</h2>
                  <span
                    className={`${styles.pill} ${
                      book.status === "comingSoon" ? styles.comingSoon : ""
                    }`}
                  >
                    {book.status === "comingSoon" ? "Coming Soon" : "Available"}
                  </span>
                </div>
                {book.tagline && (
                  <p className={styles.tagline}>{book.tagline}</p>
                )}
                {book.shortPitch && (
                  <p className={styles.description}>{book.shortPitch}</p>
                )}
                <Link className={styles.cta} href={`/books/${book.slug}`}>
                  {book.status === "comingSoon" ? "View details" : "See where to buy"}
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
