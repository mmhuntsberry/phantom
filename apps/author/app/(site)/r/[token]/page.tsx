import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { db } from "@/db/index";
import { readerInvites } from "@/db/schema";
import ReaderTokenGate from "../../../../components/ReaderTokenGate";
import styles from "./page.module.css";

export const metadata = {
  title: "Private Reading | Matthew Huntsberry",
  description: "Private manuscript access.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ReaderTokenPage({
  params,
}: {
  params: { token: string };
}) {
  let invite;
  try {
    invite = await db
      .select()
      .from(readerInvites)
      .where(eq(readerInvites.token, params.token))
      .limit(1)
      .then((rows) => rows[0]);

    if (!invite) {
      console.error(`❌ Token not found: ${params.token}`);
      return notFound();
    }

    if (!invite.active) {
      console.error(`❌ Token found but inactive: ${params.token} (active: ${invite.active})`);
      return notFound();
    }

    console.log(`✅ Valid token: ${params.token} for program: ${invite.program}`);
  } catch (error) {
    console.error(`❌ Database error checking token ${params.token}:`, error);
    return notFound();
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <p className={styles.kicker}>Private Reading</p>
        <h1 className={styles.title}>Thanks for reading early.</h1>
        <p className={styles.subtitle}>
          This link is private. Please do not share it publicly.
        </p>
        <ReaderTokenGate
          token={params.token}
          program={invite.program}
          readingMode={invite.readingMode}
        />
      </section>
    </div>
  );
}
