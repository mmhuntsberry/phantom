import SubscribeForm from "../../components/SubscribeForm";
import styles from "./page.module.css";

export default function SubscribePage() {
  return (
    <>
      <h1 className={styles.title}>Join the Misfits & Dreamers</h1>
      <section className={styles.section}>
        <SubscribeForm />
      </section>
    </>
  );
}
