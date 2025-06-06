import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Users
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;

/**
 * Subscribers (for email list)
 */
export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribed: boolean("unsubscribed").default(false),
});

export type Subscriber = InferSelectModel<typeof subscribers>;
