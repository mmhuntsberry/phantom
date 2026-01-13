import SubscribeForm from "../../components/SubscribeForm";
import styles from "./page.module.css";

export default function SubscribePage() {
  return (
    <>
      <h1 className={styles.title}>Get first looks</h1>
      <section className={styles.section}>
        <SubscribeForm />
      </section>
    </>
  );
}
