import "./global.css";

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
      <body>{children}</body>
    </html>
  );
}
