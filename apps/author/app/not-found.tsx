import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "grid",
      placeItems: "center",
      minHeight: "60vh",
      padding: "var(--space-2xl)",
      textAlign: "center",
    }}>
      <div style={{
        display: "grid",
        gap: "var(--space-lg)",
      }}>
        <h1 style={{
          fontSize: "var(--fs-4xl)",
          fontWeight: 1000,
          margin: 0,
        }}>
          404
        </h1>
        <p style={{
          fontSize: "var(--fs-lg)",
          fontWeight: 300,
          margin: 0,
        }}>
          Page not found
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2xs)",
            border: "var(--border-width-sm) solid var(--palette-neutral-darkest)",
            borderRadius: "var(--border-radius-2xs)",
            padding: "var(--space-xs) var(--space-sm)",
            fontSize: "var(--fs-sm)",
            fontWeight: 600,
            textDecoration: "none",
            color: "inherit",
            justifySelf: "center",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
