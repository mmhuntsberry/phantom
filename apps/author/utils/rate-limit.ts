type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function checkRateLimit(params: {
  key: string;
  windowMs: number;
  max: number;
}) {
  const now = Date.now();
  const current = buckets.get(params.key);

  if (!current || current.resetAt < now) {
    buckets.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= params.max) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  current.count += 1;
  buckets.set(params.key, current);
  return { allowed: true, retryAfter: 0 };
}
