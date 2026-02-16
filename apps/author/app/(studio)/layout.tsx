export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}

export const revalidate = 10;
