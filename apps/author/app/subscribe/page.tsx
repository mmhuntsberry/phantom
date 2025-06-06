"use client";

import React, { useState } from "react";

import { PaperPlaneTilt, CircleNotch } from "@phosphor-icons/react/dist/ssr";
import Button from "../../components/button/button";
import Input from "../../components/input/input";
import Label from "../../components/label/label";
import styles from "./page.module.css";

export default function SubscribePage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.success) {
        setMessage(
          "📬 You’re in. Flash, grit, and maybe some ghosts incoming."
        );
        setEmail("");
      } else {
        setMessage(data.error || "⚠️ That didn’t stick. Try again.");
      }
    } catch (error) {
      setMessage("📵 Couldn’t reach the signal. Try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className={styles.title}>Join the Misfits & Dreamers</h1>
      <form className={styles.form} onSubmit={subscribe}>
        <Label>Enter Email</Label>
        <div className="flex gap-xs mt-xs">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email here. For the misfits, not the masses."
          />
          <Button type="submit">
            <span className="hidden md:inline-block">
              {loading ? "Sending" : "Subscribe"}
            </span>
            {loading ? (
              <CircleNotch className="animate-spin" size={24} />
            ) : (
              <PaperPlaneTilt strokeWidth={2} size={24} />
            )}{" "}
          </Button>
        </div>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </>
  );
}
