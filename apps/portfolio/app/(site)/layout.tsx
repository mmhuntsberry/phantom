"use client";
import NextLink from "next/link";
import { NavLink } from "packages/phantom-components/src/lib/components/nav-link/nav-link";
import { Navbar } from "packages/phantom-components/src/lib/components/navbar/navbar";
import { usePathname } from "next/navigation";
import "@mmhuntsberry/phantom-tokens";
import "../global.css";
import Surface from "packages/phantom-components/src/lib/components/surface/surface";

// export const metadata = {
//   title: "Matthew Huntsberry | Design Systems Engineer",
//   description: "",
// };

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/journal", label: "Journal" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body
        className="
        font-family-primary
        bg-color-primary
        text-color-primary
        m-2xl
        grid
        gap-lg
        md:grid-cols-8
        lg:grid-cols-12"
      >
        <header className="grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3">
          <Navbar>
            {navLinks.map(({ href, label }) => (
              <li key={href} className="cursor-pointer">
                <NavLink active={pathname === href}>
                  <NextLink href={href}>{label}</NextLink>
                </NavLink>
              </li>
            ))}
          </Navbar>
        </header>
        <main className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 grid-span-all md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3">
          {children}
        </main>
        <footer className="md:grid-span-2-to-neg2 lg:grid-span-3-to-neg3">
          <Surface compact={true} className="text-align-center">
            &copy; {new Date().getFullYear()} Matthew Huntsberry
          </Surface>
        </footer>
      </body>
    </html>
  );
}
