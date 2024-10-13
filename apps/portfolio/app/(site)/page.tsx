import { getStudies } from "../../sanity/sanity-utils";

import NextLink from "next/link";
import styles from "./page.module.css";

export default async function Index() {
  const studies = await getStudies();
  return (
    <div>
      <ul>
        {studies.map((study) => (
          <li key={study._id}>
            <NextLink href={`/studies/${study.slug}`}>
              <h2 className={styles.title}>{study.name}</h2>
              <p className={styles.about}>{study.about}</p>
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
