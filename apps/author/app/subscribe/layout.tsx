import Header from "../../components/header/header";
import "../global.css";
import { Copyright } from "@phosphor-icons/react/dist/ssr";
import styles from "./layout.module.css";
export const metadata = {
  title: "Subscribe",
  description: "Subscribe to the Misfits & Dreamers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className={styles.main}>
          {children}
          <footer className={styles.footer}>
            <Copyright size={24} />
            <span>
              {new Date().getFullYear()} Matthew Huntsberry. All rights
              reserved.
            </span>
          </footer>
        </main>
      </body>
    </html>
  );
}
