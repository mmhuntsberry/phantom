import "../global.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import styles from "./layout.module.css";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

// export const metadata = {
//   title: "Matthew Huntsberry | Design Systems Engineer",
//   description: "",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <Header />
        <main className={styles.main}>{children}</main>
      </body>
    </html>
  );
}

export const revalidate = 10;
