import styles from "./logo.module.css";

export default function Logo() {
  return (
    <h2 className={styles.logo}>
      <span className={styles.first}>Matthew</span>
      <span className={styles.middle}>Marshall</span>
      <span className={styles.last}>Huntsberry</span>
    </h2>
  );
}
