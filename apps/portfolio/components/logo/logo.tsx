import styles from "./logo.module.css";

export default function Logo() {
  return (
    <h2 className={styles.logo} aria-label="Matthew Huntsberry">
      <span className={styles.first}>Matthew</span>{" "}
      <span className={styles.last}>Huntsberry</span>
    </h2>
  );
}
