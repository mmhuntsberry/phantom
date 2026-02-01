"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "./button/button";
import styles from "./AdminLoginForm.module.css";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(data?.error || "Login failed.");
        setLoading(false);
        return;
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      // Verify the session was set by checking the session endpoint
      const sessionCheck = await fetch("/api/admin/session", {
        credentials: "include", // Ensure cookies are sent
      });
      const sessionData = await sessionCheck.json().catch(() => ({}));
      
      console.log("[Login] Session check result:", sessionData);
      
      if (sessionData?.authed) {
        // Cookie is set and verified, safe to redirect
        window.location.href = "/admin/reader-applicants";
      } else {
        // Cookie wasn't set properly, show error
        console.error("[Login] Session verification failed:", sessionData);
        setError("Session could not be established. Please check the browser console for details.");
        setLoading(false);
      }
    } catch {
      setError("Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <label className={styles.label} htmlFor="adminEmail">
        Email
      </label>
      <input
        id="adminEmail"
        className={styles.input}
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
      />
      <label className={styles.label} htmlFor="adminPassword">
        Password
      </label>
      <input
        id="adminPassword"
        className={styles.input}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        <Button
          type="submit"
          disabled={loading || !email.trim() || !password.trim()}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
