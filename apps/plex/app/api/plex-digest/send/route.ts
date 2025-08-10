export const runtime = "nodejs";

import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { redis } from "@/lib/redis";

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
const CRON_SECRET = process.env.DIGEST_CRON_SECRET;

const MAX_CHARS = 1200;

function chunk(text: string, limit = MAX_CHARS) {
  const out: string[] = [];
  let buf = "";
  for (const line of text.split("\n")) {
    const next = buf ? buf + "\n" + line : line;
    if (next.length > limit) {
      if (buf) out.push(buf);
      buf = line;
    } else {
      buf = next;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function fmtRange(now = new Date()) {
  const end = new Date(now);
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  const f = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${f(start)}–${f(end)}`;
}

function fmtDigest(items: any[]) {
  const movies = items
    .filter((i) => i.type === "movie")
    .sort((a, b) => a.addedAt - b.addedAt);
  const eps = items
    .filter((i) => i.type === "episode")
    .sort((a, b) => a.addedAt - b.addedAt);

  const lines: string[] = [];
  lines.push(`This week's new Plex additions (${fmtRange()}):`);

  if (movies.length) {
    lines.push("", `Movies (${movies.length}):`);
    for (const m of movies)
      lines.push(`• ${m.title}${m.year ? ` (${m.year})` : ""} — ${m.library}`);
  }
  if (eps.length) {
    lines.push("", `TV (${eps.length}):`);
    for (const e of eps) {
      const s = e.season ? `S${String(e.season).padStart(2, "0")}` : "";
      const n = e.episode ? `E${String(e.episode).padStart(2, "0")}` : "";
      const se = s || n ? ` ${s}${n}` : "";
      const et = e.episodeTitle ? ` — ${e.episodeTitle}` : "";
      lines.push(`• ${e.show ?? "Unknown Show"}${se}${et} — ${e.library}`);
    }
  }
  return lines.join("\n");
}

async function sendAll(body: string) {
  if (!RECIPIENTS.length) return;
  const subject = `Plex weekly digest (${fmtRange()})`;
  const parts = chunk(body);
  for (const to of RECIPIENTS) {
    if (parts.length === 1) {
      await transporter.sendMail({ from: FROM, to, subject, text: body });
    } else {
      for (let i = 0; i < parts.length; i += 1) {
        await transporter.sendMail({
          from: FROM,
          to,
          subject: `${subject} [part ${i + 1}/${parts.length}]`,
          text: parts[i],
        });
      }
    }
  }
}

export async function GET(req: NextRequest) {
  const preview = req.nextUrl.searchParams.get("preview") === "1";
  if (!preview) {
    if (
      !CRON_SECRET ||
      req.nextUrl.searchParams.get("secret") !== CRON_SECRET
    ) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  if (!redis) return new Response("Redis missing", { status: 500 });

  console.log("Fetching items from Redis...");
  const map = await redis.hgetall<Record<string, string>>("plex:digest:queue");
  console.log("Redis map:", map);
  const items = Object.values(map ?? {})
    .map((v) => {
      try {
        // Data is already parsed objects from Upstash Redis
        return typeof v === "string" ? JSON.parse(v) : v;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  console.log("Parsed items:", items);

  if (!items.length) {
    // In preview mode, return a friendly message instead of 204 (blank page)
    if (preview)
      return new Response("No items in digest queue yet.", { status: 200 });
    return new Response(null, { status: 204 });
  }

  const digest = fmtDigest(items);

  if (!preview) {
    await sendAll(digest);
    await redis.del("plex:digest:queue");
  }

  return new Response(preview ? digest : "OK", { status: 200 });
}
