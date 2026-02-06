import { NextResponse } from "next/server";
import { getWriteClient } from "../../../sanity/config/write-client";
import { checkRateLimit } from "../../../utils/rate-limit";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 8;

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `beta-applicant:${ip}`,
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again soon." },
      { status: 429, headers: { "Retry-After": rate.retryAfter.toString() } }
    );
  }

  const body = await req.json();
  const {
    email,
    formatPreference,
    consent,
    readingPreferences,
    referralSource,
    packetId,
    honeypot,
  } = body || {};

  if (honeypot) {
    return NextResponse.json({ success: true });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Valid email required." },
      { status: 400 }
    );
  }

  if (!formatPreference) {
    return NextResponse.json(
      { success: false, error: "Format preference required." },
      { status: 400 }
    );
  }

  if (!consent) {
    return NextResponse.json(
      { success: false, error: "Consent required." },
      { status: 400 }
    );
  }

  let client;
  try {
    client = getWriteClient();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server misconfigured." },
      { status: 500 }
    );
  }

  try {
    await client.create({
      _type: "betaApplicant",
      email: email.trim(),
      formatPreference,
      consent,
      readingPreferences,
      referralSource,
      packet: packetId
        ? { _type: "reference", _ref: packetId }
        : undefined,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Submission failed." },
      { status: 500 }
    );
  }
}
