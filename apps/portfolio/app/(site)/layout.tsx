import { Source_Sans_3 } from "next/font/google";

// import "@mmhuntsberry/phantom-tokens";
import "../global.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import About from "./components/about";

//👇 Configure our font object
const sourceSans3 = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="en" className={sourceSans3.className}>
      <body>
        <Header />
        <main className="container">
          <About />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

export const revalidate = 10;
