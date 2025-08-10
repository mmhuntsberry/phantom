import { Redis } from "@upstash/redis";

export const redis = (() => {
  try {
    return Redis.fromEnv();
  } catch {
    return null;
  }
})();
