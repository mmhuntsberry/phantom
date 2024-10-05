import NextImage from "next/image";
import { getJobs } from "../../../sanity/sanity-utils";
import styles from "./page.module.css";
import { PortableText } from "@portabletext/react";
import { Job } from "../../../types/Job";

function getImageClass(job: Job) {
  switch (job.company) {
    case "Austin Coding Academy":
      return styles.aca;
    case "IBM":
      return styles.ibm;
    default:
      return styles.image;
  }
}

export default async function Resume() {
  const jobs: Job[] = await getJobs();

  console.log(jobs);

  return (
    <div>
      <ul>
        {jobs.reverse().map((job, i) => (
          <li key={job._id} className={styles.card}>
            <div className={styles.topper}>
              <div className={styles.title}>
                <h2>{job.company}</h2>
                <h3>{job.title}</h3>
              </div>
              <NextImage
                className={getImageClass(job)}
                src={job.image}
                alt={job.company}
                width={120}
                height={70}
                sizes="(max-width: 15rem) 100vw, (max-width: 7.5rem) 50vw, 33vw"
              />
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
