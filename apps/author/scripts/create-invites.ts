import { nanoid } from "nanoid";

import { db } from "../db/index";
import { readerInvites } from "../db/schema";

const usage =
  "Usage: ts-node apps/author/scripts/create-invites.ts <program> <cohort_type> <reading_mode> <count>";

async function main() {
  const [program, cohortType, readingMode, countArg] = process.argv.slice(2);

  if (!program || !cohortType || !readingMode || !countArg) {
    console.error(usage);
    process.exit(1);
  }

  if (!/^(beta|arc)$/.test(cohortType)) {
    console.error("cohort_type must be 'beta' or 'arc'.");
    process.exit(1);
  }

  if (!/^(partial|full)$/.test(readingMode)) {
    console.error("reading_mode must be 'partial' or 'full'.");
    process.exit(1);
  }

  const count = Number.parseInt(countArg, 10);
  if (!Number.isFinite(count) || count <= 0) {
    console.error("count must be a positive integer.");
    process.exit(1);
  }

  const invites = Array.from({ length: count }, () => ({
    token: nanoid(24),
    cohortType: cohortType as "beta" | "arc",
    program,
    readingMode: readingMode as "partial" | "full",
    active: true,
    createdAt: new Date(),
  }));

  await db.insert(readerInvites).values(invites);

  invites.forEach((invite) => {
    console.log(`/r/${invite.token}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
