import { serial, text, pgTable, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';

// Define category enum for database
export const categoryEnum = pgEnum('category', ['Beer', 'Gym']);

export const spendingEntriesTable = pgTable('spending_entries', {
  id: serial('id').primaryKey(),
  category: categoryEnum('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull(),
  description: text('description'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript types for the table schema
export type SpendingEntry = typeof spendingEntriesTable.$inferSelect; // For SELECT operations
export type NewSpendingEntry = typeof spendingEntriesTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { spendingEntries: spendingEntriesTable };