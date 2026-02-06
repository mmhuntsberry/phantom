import { NextResponse } from "next/server";
import { getWriteClient } from "../../../sanity/config/write-client";
import { checkRateLimit } from "../../../utils/rate-limit";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;

function getClientIp(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rate = checkRateLimit({
    key: `beta-feedback:${ip}`,
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
    packetId,
    hookMoment,
    attentionDrop,
    confusion,
    characterReal,
    keepReading,
    stopPoint,
    testimonialPermission,
    attributionPreference,
    attributionName,
  } = body || {};

  if (!packetId) {
    return NextResponse.json(
      { success: false, error: "Packet required." },
      { status: 400 }
    );
  }

  if (!hookMoment || !confusion || !characterReal || !keepReading) {
    return NextResponse.json(
      { success: false, error: "Missing required answers." },
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
      _type: "betaFeedback",
      packet: { _type: "reference", _ref: packetId },
      hookMoment,
      attentionDrop,
      confusion,
      characterReal,
      keepReading,
      stopPoint,
      testimonialPermission,
      attributionPreference,
      attributionName,
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
