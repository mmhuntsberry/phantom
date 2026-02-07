"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

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
          Something went wrong
        </h1>
        <p style={{
          fontSize: "var(--fs-lg)",
          fontWeight: 300,
          margin: 0,
        }}>
          {error.message || "An unexpected error occurred"}
        </p>
        <div style={{
          display: "flex",
          gap: "var(--space-sm)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2xs)",
              border: "var(--border-width-sm) solid var(--palette-neutral-darkest)",
              borderRadius: "var(--border-radius-2xs)",
              padding: "var(--space-xs) var(--space-sm)",
              fontSize: "var(--fs-sm)",
              fontWeight: 600,
              background: "var(--palette-neutral-lightest)",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
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
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
