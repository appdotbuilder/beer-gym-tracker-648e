import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type Category, type CreateSpendingEntryInput } from '../schema';
import { getCategorySummary } from '../handlers/get_category_summary';

// Test data for spending entries
const beerEntries: CreateSpendingEntryInput[] = [
  {
    category: 'Beer',
    amount: 15.50,
    date: new Date('2023-01-15'),
    description: 'Craft beer at brewery'
  },
  {
    category: 'Beer',
    amount: 8.25,
    date: new Date('2023-02-10'),
    description: 'Beer with friends'
  },
  {
    category: 'Beer',
    amount: 12.00,
    date: new Date('2023-03-05'),
    description: null
  }
];

const gymEntries: CreateSpendingEntryInput[] = [
  {
    category: 'Gym',
    amount: 45.00,
    date: new Date('2023-01-01'),
    description: 'Monthly membership'
  },
  {
    category: 'Gym',
    amount: 25.50,
    date: new Date('2023-02-15'),
    description: 'Personal training session'
  }
];

describe('getCategorySummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero totals for empty category', async () => {
    const result = await getCategorySummary('Beer');

    expect(result.category).toEqual('Beer');
    expect(result.total).toEqual(0);
    expect(result.count).toEqual(0);
  });

  it('should calculate correct summary for Beer category', async () => {
    // Insert test beer entries
    await db.insert(spendingEntriesTable)
      .values(beerEntries.map(entry => ({
        ...entry,
        amount: entry.amount.toString() // Convert number to string for numeric column
      })))
      .execute();

    const result = await getCategorySummary('Beer');

    expect(result.category).toEqual('Beer');
    expect(result.total).toEqual(35.75); // 15.50 + 8.25 + 12.00
    expect(result.count).toEqual(3);
  });

  it('should calculate correct summary for Gym category', async () => {
    // Insert test gym entries
    await db.insert(spendingEntriesTable)
      .values(gymEntries.map(entry => ({
        ...entry,
        amount: entry.amount.toString() // Convert number to string for numeric column
      })))
      .execute();

    const result = await getCategorySummary('Gym');

    expect(result.category).toEqual('Gym');
    expect(result.total).toEqual(70.50); // 45.00 + 25.50
    expect(result.count).toEqual(2);
  });

  it('should only include entries from specified category', async () => {
    // Insert entries for both categories
    const allEntries = [...beerEntries, ...gymEntries];
    await db.insert(spendingEntriesTable)
      .values(allEntries.map(entry => ({
        ...entry,
        amount: entry.amount.toString() // Convert number to string for numeric column
      })))
      .execute();

    // Test Beer category summary
    const beerResult = await getCategorySummary('Beer');
    expect(beerResult.category).toEqual('Beer');
    expect(beerResult.total).toEqual(35.75);
    expect(beerResult.count).toEqual(3);

    // Test Gym category summary
    const gymResult = await getCategorySummary('Gym');
    expect(gymResult.category).toEqual('Gym');
    expect(gymResult.total).toEqual(70.50);
    expect(gymResult.count).toEqual(2);
  });

  it('should handle decimal amounts correctly', async () => {
    // Insert entry with precise decimal amount
    const preciseEntry = {
      category: 'Beer' as Category,
      amount: 13.47,
      date: new Date('2023-01-01'),
      description: 'Precise amount test'
    };

    await db.insert(spendingEntriesTable)
      .values({
        ...preciseEntry,
        amount: preciseEntry.amount.toString()
      })
      .execute();

    const result = await getCategorySummary('Beer');

    expect(result.total).toEqual(13.47);
    expect(result.count).toEqual(1);
    expect(typeof result.total).toBe('number');
  });

  it('should return correct data types', async () => {
    // Insert one entry
    await db.insert(spendingEntriesTable)
      .values({
        category: 'Gym',
        amount: '50.00',
        date: new Date('2023-01-01'),
        description: 'Type check entry'
      })
      .execute();

    const result = await getCategorySummary('Gym');

    // Verify return types
    expect(typeof result.category).toBe('string');
    expect(typeof result.total).toBe('number');
    expect(typeof result.count).toBe('number');
    expect(result.category).toEqual('Gym');
  });
});