import styles from "./page.module.css";
import AdminLoginForm from "../../../../components/AdminLoginForm";

export const metadata = {
  title: "Admin Login | Matthew Huntsberry",
  description: "Admin login.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Admin</p>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Sign in to manage reader programs.</p>
      </section>

      <AdminLoginForm />
    </div>
  );
}
