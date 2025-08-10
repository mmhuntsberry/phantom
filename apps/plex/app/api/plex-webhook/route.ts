export const runtime = "nodejs";

import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { redis } from "@/lib/redis";

// SMTP email transport (use e.g. Gmail App Password or any SMTP provider)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: (process.env.SMTP_SECURE ?? "true") === "true",
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

const FROM = process.env.EMAIL_FROM!;
const RECIPIENTS = (process.env.EMAIL_TO ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const REQUIRED_SECRET = process.env.PLEX_SECRET;
const LOCK_UUID = process.env.PLEX_SERVER_UUID;

const MODE =
  process.env.DISPATCH_MODE ??
  (process.env.NODE_ENV === "production" ? "digest" : "immediate");

function fmtImmediate(meta: any) {
  const section = meta?.librarySectionTitle ?? "Library";
  if (meta?.type === "movie") {
    const year = meta.year ? ` (${meta.year})` : "";
    return `New movie: ${meta.title}${year} added to ${section}.`;
  }
  if (meta?.type === "episode") {
    const show = meta.grandparentTitle || meta.parentTitle || "Unknown Show";
    const s = meta.parentIndex
      ? `S${String(meta.parentIndex).padStart(2, "0")}`
      : "";
    const e = meta.index ? `E${String(meta.index).padStart(2, "0")}` : "";
    const se = s || e ? ` ${s}${e}` : "";
    const et = meta.title ? ` — ${meta.title}` : "";
    return `New episode: ${show}${se}${et} added to ${section}.`;
  }
  return `New ${meta?.type ?? "item"}: ${
    meta?.title ?? "Unknown"
  } added to ${section}.`;
}

function fmtImmediateSubject(meta: any) {
  if (meta?.type === "movie") {
    const year = meta.year ? ` (${meta.year})` : "";
    return `Plex: New movie — ${meta.title}${year}`;
  }
  if (meta?.type === "episode") {
    const show = meta.grandparentTitle || meta.parentTitle || "Unknown Show";
    const s = meta.parentIndex
      ? `S${String(meta.parentIndex).padStart(2, "0")}`
      : "";
    const e = meta.index ? `E${String(meta.index).padStart(2, "0")}` : "";
    const se = s || e ? ` ${s}${e}` : "";
    return `Plex: New episode — ${show}${se}`;
  }
  return `Plex: New ${meta?.type ?? "item"}`;
}

function toRecord(meta: any) {
  const addedAt =
    (meta?.addedAt ? Date.parse(meta.addedAt) : NaN) || Date.now();
  const key = String(
    meta?.ratingKey ?? meta?.guid ?? `${meta?.type}:${meta?.title}:${addedAt}`
  );
  return {
    key,
    type: meta?.type ?? "item",
    title: meta?.title ?? "Unknown",
    year: meta?.year ?? null,
    library: meta?.librarySectionTitle ?? "Library",
    show: meta?.grandparentTitle ?? meta?.parentTitle ?? null,
    season: meta?.parentIndex ?? null,
    episode: meta?.index ?? null,
    episodeTitle: meta?.type === "episode" ? meta?.title ?? null : null,
    addedAt,
  };
}

async function sendEmail(body: string, subject: string) {
  if (!RECIPIENTS.length) return;
  await Promise.all(
    RECIPIENTS.map((to) =>
      transporter.sendMail({ from: FROM, to, subject, text: body })
    )
  );
}

export async function POST(req: NextRequest) {
  if (
    REQUIRED_SECRET &&
    req.nextUrl.searchParams.get("secret") !== REQUIRED_SECRET
  ) {
    return new Response("Forbidden", { status: 403 });
  }

  const ct = req.headers.get("content-type") ?? "";
  let payload: any;
  try {
    if (ct.startsWith("multipart/")) {
      const form = await req.formData();
      const json = form.get("payload");
      if (typeof json !== "string") throw new Error("Missing payload");
      payload = JSON.parse(json);
    } else {
      payload = await req.json();
    }
  } catch (e) {
    console.error("Parse error", e);
    return new Response("Bad Request", { status: 400 });
  }

  console.log("Webhook received:", JSON.stringify(payload, null, 2));

  if (LOCK_UUID && payload?.Server?.uuid && payload.Server.uuid !== LOCK_UUID) {
    return new Response("Wrong server", { status: 403 });
  }

  if (payload?.event !== "library.new" || !payload?.Metadata) {
    return new Response(null, { status: 204 });
  }

  const meta = payload.Metadata;
  const record = toRecord(meta);

  console.log("Redis available:", !!redis);
  console.log("Queueing item:", record.key);

  if (redis) {
    try {
      await redis.hset("plex:digest:queue", {
        [record.key]: JSON.stringify(record),
      });
      console.log("Successfully queued to Redis");
    } catch (err) {
      console.error("Redis hset failed", err);
    }
  } else {
    console.log("Redis not available - skipping queue");
  }

  if (MODE === "immediate") {
    try {
      await sendEmail(fmtImmediate(meta), fmtImmediateSubject(meta));
    } catch (err) {
      console.error("Email send failed", err);
    }
  }

  return new Response(null, { status: 204 });
}
