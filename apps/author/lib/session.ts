type SessionPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};

function hasBuffer(): boolean {
  return typeof (globalThis as any).Buffer !== "undefined";
}

function bytesToBase64(bytes: Uint8Array): string {
  if (hasBuffer()) {
    return (globalThis as any).Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  if (hasBuffer()) {
    return new Uint8Array((globalThis as any).Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncodeBytes(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlEncodeJson(value: unknown): string {
  const json = JSON.stringify(value);
  return base64urlEncodeBytes(new TextEncoder().encode(json));
}

function base64urlDecodeToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const withPad = padded + "=".repeat(padLen);
  return new TextDecoder().decode(base64ToBytes(withPad));
}

function getAuthSecret(): string | null {
  return process.env.AUTH_SECRET || process.env.JWT_SECRET || null;
}

async function hmacSha256(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return base64urlEncodeBytes(new Uint8Array(sig));
}

export async function signAdminSession(input: {
  userId: string;
  email: string;
  ttlSeconds?: number;
}): Promise<string> {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET (or JWT_SECRET) must be set");

  const now = Math.floor(Date.now() / 1000);
  const ttlSeconds = input.ttlSeconds ?? 60 * 60 * 24 * 30;
  const payload: SessionPayload = {
    sub: input.userId,
    email: input.email,
    iat: now,
    exp: now + ttlSeconds,
  };

  const payloadPart = base64urlEncodeJson(payload);
  const sig = await hmacSha256(secret, payloadPart);
  return `${payloadPart}.${sig}`;
}

export async function verifyAdminSession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const secret = getAuthSecret();
  if (!secret) return null;

  const [payloadPart, sigPart] = token.split(".");
  if (!payloadPart || !sigPart) return null;

  const expectedSig = await hmacSha256(secret, payloadPart);
  if (expectedSig !== sigPart) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64urlDecodeToString(payloadPart));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now) return null;
  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    return null;
  }
  return payload;
}
