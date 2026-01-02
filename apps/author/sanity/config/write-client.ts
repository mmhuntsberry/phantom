import { createClient } from "next-sanity";
import config from "./client-config";

const writeToken = process.env.SANITY_WRITE_TOKEN;

const writeClient = createClient({
  ...config,
  token: writeToken,
  useCdn: false,
});

export function getWriteClient() {
  if (!writeToken) {
    throw new Error("Missing SANITY_WRITE_TOKEN");
  }

  return writeClient;
}
