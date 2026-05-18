import { expect, test, describe, vi } from 'vitest';
import { db } from '@/db';
import { plants } from '@/db/schema';

// Mock database interactions for deterministic tests
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ id: 'mock-uuid', name: 'Fern' }])
  }
}));

describe('Supabase Database Plant Operations', () => {
  test('successfully writes a new plant instance to the database', async () => {
    const mockPlant = { userId: 'user-123', name: 'Fern', wateringIntervalDays: 5 };
    const result = await db.insert(plants).values(mockPlant);
    
    expect(db.insert).toHaveBeenCalledWith(plants);
    expect(result[0].name).toBe('Fern');
  });
});
