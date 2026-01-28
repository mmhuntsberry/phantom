import { getJobs } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";
import { PortableText } from "@portabletext/react";
import { Job } from "../../../types/Job";
import {
  CaretDown,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { PortableTextComponents } from "@portabletext/react";

export default async function Resume() {
  const jobs: Job[] = await getJobs();
  const sortedJobs = [...jobs].sort(
    (a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
  );

  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "mmhuntsberry@gmail.com";
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  const components: PortableTextComponents = {
    block: {
      h2: ({ children }) => <h4 className={styles.proseH}>{children}</h4>,
      h3: ({ children }) => <h4 className={styles.proseH}>{children}</h4>,
      normal: ({ children }) => <p className={styles.proseP}>{children}</p>,
    },
    list: {
      bullet: ({ children }) => <ul className={styles.proseUl}>{children}</ul>,
      number: ({ children }) => <ol className={styles.proseOl}>{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className={styles.proseLi}>{children}</li>,
      number: ({ children }) => <li className={styles.proseLi}>{children}</li>,
    },
  };

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.pageTitle}>Resume</h1>
            <p className={styles.pageLede}>
              Design systems leadership, front end engineering, and platform-minded
              delivery.
            </p>
          </div>

          <div className={styles.headerLinks} aria-label="Contact links">
            <a
              className={styles.iconLink}
              href={`mailto:${contactEmail}`}
              aria-label="Email"
            >
              <EnvelopeSimple size={20} />
            </a>
            {linkedinUrl && (
              <a
                className={styles.iconLink}
                href={linkedinUrl}
                aria-label="LinkedIn"
                target="_blank"
                rel="noreferrer"
              >
                <LinkedinLogo size={20} />
              </a>
            )}
            {githubUrl && (
              <a
                className={styles.iconLink}
                href={githubUrl}
                aria-label="GitHub"
                target="_blank"
                rel="noreferrer"
              >
                <GithubLogo size={20} />
              </a>
            )}
          </div>
        </div>

        <div className={styles.snapshot} aria-label="Resume summary">
          <div className={styles.snapshotLead}>
            <p className={styles.snapshotKicker}>At a glance</p>
            <p className={styles.snapshotTitle}>
              I build design system infrastructure that makes shipping feel predictable.
            </p>
            <p className={styles.snapshotBody}>
              Tokens, theming, components, documentation, and the workflows that keep them aligned
              across design and engineering.
            </p>
          </div>

          <ul className={styles.snapshotGrid} aria-label="Highlights">
            <li className={styles.snapshotCard}>
              <p className={styles.snapshotCardTitle}>Scale</p>
              <p className={styles.snapshotCardBody}>
                Multi-brand theming, token architecture, and rollout strategies that hold up.
              </p>
            </li>
            <li className={styles.snapshotCard}>
              <p className={styles.snapshotCardTitle}>Accessibility</p>
              <p className={styles.snapshotCardBody}>
                Patterns and guardrails that make WCAG work the default, not a checklist.
              </p>
            </li>
            <li className={styles.snapshotCard}>
              <p className={styles.snapshotCardTitle}>Ops</p>
              <p className={styles.snapshotCardBody}>
                Tooling, CI gates, and documentation workflows that keep the system healthy.
              </p>
            </li>
          </ul>
        </div>
      </header>

      <section aria-label="Experience">
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <p className={styles.sectionHint}>Skim the highlights first, then dive deeper.</p>
        </div>

        <ul className={styles.jobs}>
          {sortedJobs.map((job) => (
            <li key={job._id}>
              <details className={styles.card}>
                <summary className={styles.jobHeader}>
                  {job.image ? (
                    <div className={styles.logoWrap} aria-hidden="true">
                      <img className={styles.logoImg} src={job.image} alt="" loading="lazy" />
                    </div>
                  ) : (
                    <div className={styles.logoFallback} aria-hidden="true">
                      {job.company.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className={styles.jobTitle}>
                    <h3 className={styles.company}>{job.company}</h3>
                    <p className={styles.role}>{job.title}</p>
                  </div>

                  <CaretDown className={styles.jobArrow} size={24} aria-hidden="true" />
                </summary>

                <div className={styles.content}>
                  <PortableText value={job.content} components={components} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
