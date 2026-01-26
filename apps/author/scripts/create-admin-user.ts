import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword } from "../lib/password";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set.`);
  }
  return value;
}

async function main() {
  const email = requireEnv("ADMIN_EMAIL").trim();
  const password = requireEnv("ADMIN_PASSWORD");

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  const hashed = hashPassword(password);

  if (existing) {
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, existing.id));
    console.log(`Updated admin user password for ${email}`);
    return;
  }

  const id = nanoid(16);
  await db.insert(users).values({
    id,
    email,
    password: hashed,
    createdAt: new Date(),
  });
  console.log(`Created admin user ${email} (${id})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
