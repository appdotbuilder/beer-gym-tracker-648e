import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type CategorySummary, type Category } from '../schema';
import { eq, sum, count } from 'drizzle-orm';

export async function getCategorySummary(category: Category): Promise<CategorySummary> {
  try {
    // Query for category summary using aggregation functions
    const result = await db.select({
      total: sum(spendingEntriesTable.amount),
      count: count(spendingEntriesTable.id)
    })
    .from(spendingEntriesTable)
    .where(eq(spendingEntriesTable.category, category))
    .execute();

    // Extract the aggregated data
    const aggregateData = result[0];
    
    // Convert numeric total to number (sum returns string for numeric columns)
    const total = aggregateData.total ? parseFloat(aggregateData.total) : 0;
    const entryCount = aggregateData.count || 0;

    return {
      category,
      total,
      count: entryCount
    };
  } catch (error) {
    console.error('Category summary fetch failed:', error);
    throw error;
  }
}