import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type CreateSpendingEntryInput, type SpendingEntry } from '../schema';

export const createSpendingEntry = async (input: CreateSpendingEntryInput): Promise<SpendingEntry> => {
  try {
    // Validate input
    if (!input.category || !input.amount || !input.date) {
      throw new Error('Missing required fields: category, amount, and date are required');
    }

    if (input.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Insert spending entry record
    const result = await db.insert(spendingEntriesTable)
      .values({
        category: input.category,
        amount: input.amount.toString(), // Convert number to string for numeric column
        date: input.date,
        description: input.description
      })
      .returning()
      .execute();

    // Handle case where insert didn't return a result
    if (!result || result.length === 0) {
      throw new Error('Failed to create spending entry: No result returned');
    }

    // Convert numeric fields back to numbers before returning
    const spendingEntry = result[0];
    return {
      ...spendingEntry,
      amount: parseFloat(spendingEntry.amount) // Convert string back to number
    };
  } catch (error) {
    console.error('Spending entry creation failed:', error);
    throw error;
  }
};