import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { type CreateSpendingEntryInput } from '../schema';
import { createSpendingEntry } from '../handlers/create_spending_entry';
import { eq } from 'drizzle-orm';

// Test input for Beer category
const testBeerInput: CreateSpendingEntryInput = {
  category: 'Beer',
  amount: 12.50,
  date: new Date('2024-01-15'),
  description: 'Craft beer at local brewery'
};

// Test input for Gym category
const testGymInput: CreateSpendingEntryInput = {
  category: 'Gym',
  amount: 45.00,
  date: new Date('2024-01-16'),
  description: 'Monthly gym membership'
};

// Test input with null description
const testNullDescriptionInput: CreateSpendingEntryInput = {
  category: 'Beer',
  amount: 8.99,
  date: new Date('2024-01-17'),
  description: null
};

describe('createSpendingEntry', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a spending entry for Beer category', async () => {
    const result = await createSpendingEntry(testBeerInput);

    // Basic field validation
    expect(result.category).toEqual('Beer');
    expect(result.amount).toEqual(12.50);
    expect(typeof result.amount).toBe('number');
    expect(result.date).toEqual(new Date('2024-01-15'));
    expect(result.description).toEqual('Craft beer at local brewery');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a spending entry for Gym category', async () => {
    const result = await createSpendingEntry(testGymInput);

    // Basic field validation
    expect(result.category).toEqual('Gym');
    expect(result.amount).toEqual(45.00);
    expect(typeof result.amount).toBe('number');
    expect(result.date).toEqual(new Date('2024-01-16'));
    expect(result.description).toEqual('Monthly gym membership');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should handle null description correctly', async () => {
    const result = await createSpendingEntry(testNullDescriptionInput);

    expect(result.category).toEqual('Beer');
    expect(result.amount).toEqual(8.99);
    expect(result.description).toBeNull();
    expect(result.id).toBeDefined();
  });

  it('should save spending entry to database', async () => {
    const result = await createSpendingEntry(testBeerInput);

    // Query using proper drizzle syntax
    const entries = await db.select()
      .from(spendingEntriesTable)
      .where(eq(spendingEntriesTable.id, result.id))
      .execute();

    expect(entries).toHaveLength(1);
    expect(entries[0].category).toEqual('Beer');
    expect(parseFloat(entries[0].amount)).toEqual(12.50);
    expect(entries[0].date).toEqual(new Date('2024-01-15'));
    expect(entries[0].description).toEqual('Craft beer at local brewery');
    expect(entries[0].created_at).toBeInstanceOf(Date);
  });

  it('should preserve decimal precision for amounts', async () => {
    const preciseAmountInput: CreateSpendingEntryInput = {
      category: 'Beer',
      amount: 7.99,
      date: new Date('2024-01-18'),
      description: 'Precise amount test'
    };

    const result = await createSpendingEntry(preciseAmountInput);

    expect(result.amount).toEqual(7.99);
    expect(typeof result.amount).toBe('number');

    // Verify in database
    const dbEntry = await db.select()
      .from(spendingEntriesTable)
      .where(eq(spendingEntriesTable.id, result.id))
      .execute();

    expect(parseFloat(dbEntry[0].amount)).toEqual(7.99);
  });

  it('should create multiple entries with unique IDs', async () => {
    const result1 = await createSpendingEntry(testBeerInput);
    const result2 = await createSpendingEntry(testGymInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.created_at).toBeInstanceOf(Date);
    expect(result2.created_at).toBeInstanceOf(Date);

    // Verify both entries exist in database
    const allEntries = await db.select()
      .from(spendingEntriesTable)
      .execute();

    expect(allEntries).toHaveLength(2);
    
    const categories = allEntries.map(entry => entry.category);
    expect(categories).toContain('Beer');
    expect(categories).toContain('Gym');
  });

  it('should handle various date formats correctly', async () => {
    const dateTestInput: CreateSpendingEntryInput = {
      category: 'Gym',
      amount: 25.00,
      date: new Date('2024-12-31T23:59:59.999Z'),
      description: 'Year-end workout'
    };

    const result = await createSpendingEntry(dateTestInput);

    expect(result.date).toEqual(new Date('2024-12-31T23:59:59.999Z'));
    expect(result.date).toBeInstanceOf(Date);
  });
});