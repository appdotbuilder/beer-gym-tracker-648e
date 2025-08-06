import { z } from 'zod';

// Category enum for spending activities
export const categorySchema = z.enum(['Beer', 'Gym']);
export type Category = z.infer<typeof categorySchema>;

// Spending entry schema
export const spendingEntrySchema = z.object({
  id: z.number(),
  category: categorySchema,
  amount: z.number().positive(),
  date: z.coerce.date(),
  description: z.string().nullable(),
  created_at: z.coerce.date()
});

export type SpendingEntry = z.infer<typeof spendingEntrySchema>;

// Input schema for creating spending entries
export const createSpendingEntryInputSchema = z.object({
  category: categorySchema,
  amount: z.number().positive(),
  date: z.coerce.date(),
  description: z.string().nullable()
});

export type CreateSpendingEntryInput = z.infer<typeof createSpendingEntryInputSchema>;

// Category summary schema for totals calculation
export const categorySummarySchema = z.object({
  category: categorySchema,
  total: z.number(),
  count: z.number()
});

export type CategorySummary = z.infer<typeof categorySummarySchema>;

// Overall summary schema to determine user type
export const spendingSummarySchema = z.object({
  beer_total: z.number(),
  gym_total: z.number(),
  beer_count: z.number(),
  gym_count: z.number(),
  user_type: z.enum(['beer_enthusiast', 'fitness_enthusiast', 'balanced'])
});

export type SpendingSummary = z.infer<typeof spendingSummarySchema>;