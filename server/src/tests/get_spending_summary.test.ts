import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { spendingEntriesTable } from '../db/schema';
import { getSpendingSummary } from '../handlers/get_spending_summary';

describe('getSpendingSummary', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty summary with balanced user type when no entries exist', async () => {
    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(0);
    expect(result.gym_total).toEqual(0);
    expect(result.beer_count).toEqual(0);
    expect(result.gym_count).toEqual(0);
    expect(result.user_type).toEqual('balanced');
  });

  it('should calculate beer enthusiast summary correctly', async () => {
    // Insert beer entries
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Beer',
        amount: '15.50',
        date: new Date('2024-01-01'),
        description: 'Craft beer'
      },
      {
        category: 'Beer',
        amount: '8.25',
        date: new Date('2024-01-02'),
        description: 'Happy hour'
      }
    ]).execute();

    // Insert gym entry (less than beer total)
    await db.insert(spendingEntriesTable).values({
      category: 'Gym',
      amount: '20.00',
      date: new Date('2024-01-01'),
      description: 'Monthly membership'
    }).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(23.75);
    expect(result.gym_total).toEqual(20.00);
    expect(result.beer_count).toEqual(2);
    expect(result.gym_count).toEqual(1);
    expect(result.user_type).toEqual('beer_enthusiast');
  });

  it('should calculate fitness enthusiast summary correctly', async () => {
    // Insert gym entries (higher total)
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Gym',
        amount: '50.00',
        date: new Date('2024-01-01'),
        description: 'Monthly membership'
      },
      {
        category: 'Gym',
        amount: '25.00',
        date: new Date('2024-01-15'),
        description: 'Personal training'
      }
    ]).execute();

    // Insert beer entry (lower total)
    await db.insert(spendingEntriesTable).values({
      category: 'Beer',
      amount: '12.50',
      date: new Date('2024-01-02'),
      description: 'Weekend beer'
    }).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(12.50);
    expect(result.gym_total).toEqual(75.00);
    expect(result.beer_count).toEqual(1);
    expect(result.gym_count).toEqual(2);
    expect(result.user_type).toEqual('fitness_enthusiast');
  });

  it('should calculate balanced user type when totals are equal', async () => {
    // Insert equal spending for both categories
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Beer',
        amount: '30.00',
        date: new Date('2024-01-01'),
        description: 'Weekend drinks'
      },
      {
        category: 'Gym',
        amount: '30.00',
        date: new Date('2024-01-01'),
        description: 'Monthly membership'
      }
    ]).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(30.00);
    expect(result.gym_total).toEqual(30.00);
    expect(result.beer_count).toEqual(1);
    expect(result.gym_count).toEqual(1);
    expect(result.user_type).toEqual('balanced');
  });

  it('should handle only beer entries', async () => {
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Beer',
        amount: '10.00',
        date: new Date('2024-01-01'),
        description: 'Craft beer'
      },
      {
        category: 'Beer',
        amount: '15.99',
        date: new Date('2024-01-02'),
        description: 'Premium beer'
      }
    ]).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(25.99);
    expect(result.gym_total).toEqual(0);
    expect(result.beer_count).toEqual(2);
    expect(result.gym_count).toEqual(0);
    expect(result.user_type).toEqual('beer_enthusiast');
  });

  it('should handle only gym entries', async () => {
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Gym',
        amount: '45.00',
        date: new Date('2024-01-01'),
        description: 'Monthly fee'
      },
      {
        category: 'Gym',
        amount: '20.00',
        date: new Date('2024-01-15'),
        description: 'Equipment rental'
      },
      {
        category: 'Gym',
        amount: '35.50',
        date: new Date('2024-01-20'),
        description: 'Personal training'
      }
    ]).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(0);
    expect(result.gym_total).toEqual(100.50);
    expect(result.beer_count).toEqual(0);
    expect(result.gym_count).toEqual(3);
    expect(result.user_type).toEqual('fitness_enthusiast');
  });

  it('should handle decimal amounts correctly', async () => {
    await db.insert(spendingEntriesTable).values([
      {
        category: 'Beer',
        amount: '7.99',
        date: new Date('2024-01-01'),
        description: 'Budget beer'
      },
      {
        category: 'Beer',
        amount: '12.33',
        date: new Date('2024-01-02'),
        description: 'Craft beer'
      },
      {
        category: 'Gym',
        amount: '49.99',
        date: new Date('2024-01-01'),
        description: 'Monthly membership'
      }
    ]).execute();

    const result = await getSpendingSummary();

    expect(result.beer_total).toEqual(20.32);
    expect(result.gym_total).toEqual(49.99);
    expect(result.beer_count).toEqual(2);
    expect(result.gym_count).toEqual(1);
    expect(result.user_type).toEqual('fitness_enthusiast');
  });
});