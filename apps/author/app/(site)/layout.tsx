import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import styles from "./layout.module.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.body}>
      <Header />
      <main className={styles.main}>{children}</main>
      {/* <Footer /> */}
    </div>
  );
}

export const revalidate = 10;
