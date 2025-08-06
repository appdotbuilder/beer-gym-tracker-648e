import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type SpendingSummary } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const getSpendingSummary = async (): Promise<SpendingSummary> => {
  try {
    // Query to get category totals and counts in a single query
    const summaryResults = await db.select({
      category: spendingEntriesTable.category,
      total: sql<string>`sum(${spendingEntriesTable.amount})`.as('total'),
      count: sql<string>`count(*)`.as('count')
    })
    .from(spendingEntriesTable)
    .groupBy(spendingEntriesTable.category)
    .execute();

    // Initialize values
    let beer_total = 0;
    let gym_total = 0;
    let beer_count = 0;
    let gym_count = 0;

    // Process results - convert numeric strings to numbers
    summaryResults.forEach(result => {
      const total = parseFloat(result.total || '0');
      const count = parseInt(result.count || '0', 10);

      if (result.category === 'Beer') {
        beer_total = total;
        beer_count = count;
      } else if (result.category === 'Gym') {
        gym_total = total;
        gym_count = count;
      }
    });

    // Determine user type based on spending amounts
    let user_type: 'beer_enthusiast' | 'fitness_enthusiast' | 'balanced';
    
    if (beer_total > gym_total) {
      user_type = 'beer_enthusiast';
    } else if (gym_total > beer_total) {
      user_type = 'fitness_enthusiast';
    } else {
      user_type = 'balanced';
    }

    return {
      beer_total,
      gym_total,
      beer_count,
      gym_count,
      user_type
    };
  } catch (error) {
    console.error('Failed to get spending summary:', error);
    throw error;
  }
};