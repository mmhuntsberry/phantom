import { getJobs } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";
import { PortableText } from "@portabletext/react";
import { Job } from "../../../types/Job";

export default async function Resume() {
  const jobs: Job[] = await getJobs();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>Resume</h1>
        <p className={styles.pageLede}>
          Design systems leadership, front end engineering, and platform-minded
          delivery.
        </p>
      </header>
      <ul>
        {jobs.reverse().map((job) => (
          <li key={job._id} className={styles.card}>
            <div className={styles.topper}>
              <div className={styles.title}>
                <h2>{job.company}</h2>
                <h3>{job.title}</h3>
              </div>
            </div>
            <div className={styles.content}>
              <PortableText value={job.content} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
