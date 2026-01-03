import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBook, getBooks } from "../../../../sanity/sanity-utils";
import RichText from "../../../../components/RichText";
import SubscribeForm from "../../../../components/SubscribeForm";
import styles from "./page.module.css";

export async function generateStaticParams() {
  try {
    const books = await getBooks();
    return books
      .filter((book) => book.slug)
      .map((book) => ({ slug: book.slug }));
  } catch (error) {
    console.error("Error generating static params for books:", error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const book = await getBook(params.slug);
  if (!book) {
    return {
      title: "Book Not Found | Matthew Huntsberry",
      description: "This book could not be found.",
    };
  }

  return {
    title: `${book.title} | Books | Matthew Huntsberry`,
    description: book.shortPitch || book.tagline || "Book details and excerpts.",
  };
}

export default async function BookPage({
  params,
}: {
  params: { slug: string };
}) {
  const book = await getBook(params.slug);
  if (!book) return notFound();

  const isComingSoon = book.status === "comingSoon";
  const hasBuyLinks = Boolean(
    book.buyLinks?.amazon || book.buyLinks?.direct || book.buyLinks?.other
  );

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        {book.cover?.asset?.url && (
          <div className={styles.cover}>
            <Image
              src={book.cover.asset.url}
              alt={book.cover.alt || book.title}
              fill
              className={styles.coverImage}
            />
          </div>
        )}
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Book</p>
          <h1 className={styles.title}>{book.title}</h1>
          {book.tagline && <p className={styles.tagline}>{book.tagline}</p>}
          {book.shortPitch && (
            <p className={styles.pitch}>{book.shortPitch}</p>
          )}
          <div className={styles.ctaRow}>
            {isComingSoon ? (
              <span className={styles.status}>Coming Soon</span>
            ) : hasBuyLinks ? (
              <>
                {book.buyLinks?.amazon && (
                  <Link
                    className={styles.cta}
                    href={book.buyLinks.amazon}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy on Amazon
                  </Link>
                )}
                {book.buyLinks?.direct && (
                  <Link
                    className={styles.cta}
                    href={book.buyLinks.direct}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buy Direct
                  </Link>
                )}
                {book.buyLinks?.other && (
                  <Link
                    className={styles.cta}
                    href={book.buyLinks.other}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Other Retailers
                  </Link>
                )}
              </>
            ) : (
              <span className={styles.status}>Purchase links soon</span>
            )}
          </div>
        </div>
      </section>

      {book.longDescription && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What it's about</h2>
          <RichText value={book.longDescription} />
        </section>
      )}

      {book.contentNotes && book.contentNotes.length > 0 && (
        <section className={styles.section}>
          <details className={styles.details}>
            <summary className={styles.summary}>Content notes</summary>
            <div className={styles.detailsBody}>
              <RichText value={book.contentNotes} />
            </div>
          </details>
        </section>
      )}

      {(book.sampleLink || (book.sample && book.sample.length > 0)) && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sample</h2>
          {book.sampleLink ? (
            <Link className={styles.cta} href={book.sampleLink}>
              Read the sample
            </Link>
          ) : (
            book.sample && <RichText value={book.sample} />
          )}
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Get notified</h2>
        <p className={styles.sectionIntro}>
          {isComingSoon
            ? "Be first in line when it lands."
            : "Join the list for updates and new releases."}
        </p>
        <SubscribeForm
          buttonLabel={isComingSoon ? "Join for release" : "Subscribe"}
        />
      </section>

      {book.testimonials && book.testimonials.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Praise</h2>
          <div className={styles.testimonials}>
            {book.testimonials.map((testimonial, index) => (
              <blockquote className={styles.quote} key={index}>
                <p>{testimonial.quote}</p>
                {testimonial.name && (
                  <cite className={styles.cite}>{testimonial.name}</cite>
                )}
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
