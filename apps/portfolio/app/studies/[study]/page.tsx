import StudyContent from "../../../components/StudyContent.server";
import { getStudy } from "../../../sanity/sanity-utils";
import HeroMedia from "../../../components/Hero";
import styles from "./page.module.css";
import Link from "next/link";
import { ArrowLeft, Link as LinkIcon } from "@phosphor-icons/react/dist/ssr";
import { slugify } from "../../../utils";

type Props = {
  params: {
    study: string;
  };
};

const Page = async ({ params }: Props) => {
  const study = await getStudy(params.study);
  const sections = (study.content || [])
    .filter((block: any) => block?._type === "section" && block?.title)
    .map((block: any) => ({ title: block.title as string, id: slugify(block.title as string) }));

  return (
    <article className={styles.page}>
      <header className={`container ${styles.header}`}>
        <Link className={`control ${styles.backLink}`} href="/">
          <ArrowLeft size={18} /> Back to work
        </Link>
        <p className={styles.kicker}>Case study</p>
        <h1 className={styles.title}>{study.name}</h1>
        <p className={styles.summary}>{study.summary || study.about}</p>

        <div className={styles.metaRow}>
          {study.role && <span className={styles.metaPill}>{study.role}</span>}
          {study.tags?.map((tag) => (
            <span key={tag} className={styles.metaPill}>
              {tag}
            </span>
          ))}
          {study.url && (
            <Link className={`control control--primary ${styles.metaLink}`} href={study.url}>
              <LinkIcon size={18} /> Live link
            </Link>
          )}
        </div>
      </header>

      <div className={styles.media}>
        <HeroMedia media={study.media} />
      </div>

      <div className={styles.body}>
        <div className={`container ${styles.grid}`}>
          {sections.length > 0 && (
            <details className={styles.aside} open>
              <summary className={styles.asideSummary}>On this page</summary>
              <ul className={styles.asideList}>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a className={styles.asideLink} href={`#${s.id}`}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <div className={styles.content}>
            <StudyContent title={study.name} content={study.content} />
          </div>
        </div>
      </div>
    </article>
  );
};

export default Page;
