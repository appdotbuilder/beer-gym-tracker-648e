import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type SpendingEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getSpendingEntries = async (): Promise<SpendingEntry[]> => {
  try {
    // Query spending entries ordered by date (most recent first)
    const results = await db.select()
      .from(spendingEntriesTable)
      .orderBy(desc(spendingEntriesTable.date))
      .execute();

    // Handle empty results
    if (!results || results.length === 0) {
      return [];
    }

    // Convert numeric fields back to numbers before returning
    return results.map(entry => ({
      ...entry,
      amount: parseFloat(entry.amount) // Convert string back to number
    }));
  } catch (error) {
    console.error('Failed to fetch spending entries:', error);
    throw error;
  }
};