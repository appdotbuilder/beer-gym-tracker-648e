import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type CreateSpendingEntryInput } from '../schema';
import { getSpendingEntries } from '../handlers/get_spending_entries';

// Test data
const testEntry1: Omit<CreateSpendingEntryInput, 'date'> & { date: Date } = {
  category: 'Beer',
  amount: 15.50,
  date: new Date('2023-12-01'),
  description: 'Craft beer at local pub'
};

const testEntry2: Omit<CreateSpendingEntryInput, 'date'> & { date: Date } = {
  category: 'Gym',
  amount: 45.00,
  date: new Date('2023-12-02'),
  description: 'Monthly gym membership'
};

const testEntry3: Omit<CreateSpendingEntryInput, 'date'> & { date: Date } = {
  category: 'Beer',
  amount: 8.25,
  date: new Date('2023-12-03'),
  description: null
};

describe('getSpendingEntries', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no entries exist', async () => {
    const result = await getSpendingEntries();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all spending entries ordered by date (most recent first)', async () => {
    // Insert test entries in random order
    await db.insert(spendingEntriesTable).values([
      {
        category: testEntry1.category,
        amount: testEntry1.amount.toString(),
        date: testEntry1.date,
        description: testEntry1.description
      },
      {
        category: testEntry3.category,
        amount: testEntry3.amount.toString(),
        date: testEntry3.date,
        description: testEntry3.description
      },
      {
        category: testEntry2.category,
        amount: testEntry2.amount.toString(),
        date: testEntry2.date,
        description: testEntry2.description
      }
    ]).execute();

    const result = await getSpendingEntries();

    // Should return 3 entries
    expect(result).toHaveLength(3);

    // Should be ordered by date (most recent first)
    expect(result[0].date).toEqual(testEntry3.date); // 2023-12-03
    expect(result[1].date).toEqual(testEntry2.date); // 2023-12-02
    expect(result[2].date).toEqual(testEntry1.date); // 2023-12-01

    // Verify all fields are correctly formatted
    result.forEach(entry => {
      expect(entry.id).toBeDefined();
      expect(typeof entry.id).toBe('number');
      expect(entry.category).toMatch(/^(Beer|Gym)$/);
      expect(typeof entry.amount).toBe('number');
      expect(entry.amount).toBeGreaterThan(0);
      expect(entry.date).toBeInstanceOf(Date);
      expect(entry.created_at).toBeInstanceOf(Date);
    });
  });

  it('should correctly convert numeric amounts from database', async () => {
    // Insert entry with specific amount
    await db.insert(spendingEntriesTable).values({
      category: 'Beer',
      amount: '25.99', // Stored as string in database
      date: new Date('2023-12-01'),
      description: 'Test entry'
    }).execute();

    const result = await getSpendingEntries();

    expect(result).toHaveLength(1);
    expect(typeof result[0].amount).toBe('number');
    expect(result[0].amount).toBe(25.99);
  });

  it('should handle null descriptions correctly', async () => {
    // Insert entry with null description
    await db.insert(spendingEntriesTable).values({
      category: 'Gym',
      amount: '50.00',
      date: new Date('2023-12-01'),
      description: null
    }).execute();

    const result = await getSpendingEntries();

    expect(result).toHaveLength(1);
    expect(result[0].description).toBeNull();
  });

  it('should handle both Beer and Gym categories', async () => {
    // Insert one entry of each category
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Beer',
        amount: '12.50',
        date: new Date('2023-12-01'),
        description: 'Beer entry'
      },
      {
        category: 'Gym',
        amount: '35.00',
        date: new Date('2023-12-02'),
        description: 'Gym entry'
      }
    ]).execute();

    const result = await getSpendingEntries();

    expect(result).toHaveLength(2);
    
    // Find entries by category
    const beerEntry = result.find(entry => entry.category === 'Beer');
    const gymEntry = result.find(entry => entry.category === 'Gym');
    
    expect(beerEntry).toBeDefined();
    expect(beerEntry?.amount).toBe(12.50);
    expect(beerEntry?.description).toBe('Beer entry');
    
    expect(gymEntry).toBeDefined();
    expect(gymEntry?.amount).toBe(35.00);
    expect(gymEntry?.description).toBe('Gym entry');
  });

  it('should handle large datasets correctly', async () => {
    // Create multiple entries
    const entries = Array.from({ length: 10 }, (_, i) => ({
      category: i % 2 === 0 ? 'Beer' as const : 'Gym' as const,
      amount: (10 + i).toString(),
      date: new Date(`2023-12-${String(i + 1).padStart(2, '0')}`),
      description: `Test entry ${i + 1}`
    }));

    await db.insert(spendingEntriesTable).values(entries).execute();

    const result = await getSpendingEntries();

    expect(result).toHaveLength(10);
    
    // Verify ordering (most recent first)
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].date >= result[i + 1].date).toBe(true);
    }

    // Verify all amounts are numbers
    result.forEach(entry => {
      expect(typeof entry.amount).toBe('number');
      expect(entry.amount).toBeGreaterThanOrEqual(10);
    });
  });
});