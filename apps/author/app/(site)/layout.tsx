import "../global.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import styles from "./layout.module.css";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const metadata = {
  title: "Matthew Huntsberry | Author",
  description:
    "Fiction, stories, and books by Matthew Huntsberry. Read, subscribe, and stay close to the work.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={styles.body}>
        <Header />
        <main>{children}</main>
        {/* <Footer /> */}
      </body>
    </html>
  );
}

export const revalidate = 10;
