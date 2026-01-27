// import "@mmhuntsberry/phantom-tokens";
import "../global.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

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
      <body>
        <a className="skipLink" href="#content">
          Skip to content
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

export const revalidate = 10;
