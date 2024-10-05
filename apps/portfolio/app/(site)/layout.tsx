"use client";
import { Source_Sans_3 } from "next/font/google";
import { usePathname } from "next/navigation";

// import "@mmhuntsberry/phantom-tokens";
import "../global.css";
import styles from "./layout.module.css";
import Header from "../../components/header/header";

//👇 Configure our font object
const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
});

// export const metadata = {
//   title: "Matthew Huntsberry | Design Systems Engineer",
//   description: "",
// };

export type NavLink = {
  href: string;
  label: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Work" },
  { href: "/resume", label: "Resume" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <html lang="en" className={sourceSans3.className}>
      <body>
        <Header navLinks={navLinks} />
        <main className="container">
          {pathname === "/" && (
            <p className={styles.about}>
              Hi, I'm Matt—an engineer, designer, educator, and design system
              specialist. Seamlessly bridging the gap between design and code.{" "}
              <strong>I create systems that create products.</strong>
            </p>
          )}
          <h1 className={styles.title}>
            {pathname === "/" ? "Featured Work" : "Resume"}
          </h1>
          {children}
        </main>
      </body>
    </html>
  );
}
