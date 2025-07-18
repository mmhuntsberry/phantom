import { getStudies } from "../../sanity/sanity-utils";

import NextLink from "next/link";
import styles from "./page.module.css";
import { Link } from "@phosphor-icons/react/dist/ssr";

export default async function Index() {
  const studies = await getStudies();
  return (
    <div>
      <ul>
        {studies.map((study) => (
          <li style={{ marginBottom: "24px" }} key={study._id}>
            <NextLink href={`/studies/${study.slug}`}>
              <span className={styles.linkContainer}>
                <h2 className={styles.title}>{study.name}</h2>
                <Link className={styles.icon} max={24} min={24} size={24} />
              </span>
            </NextLink>
            <p className={styles.about}>{study.about}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
