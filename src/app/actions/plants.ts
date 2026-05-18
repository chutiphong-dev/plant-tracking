'use server';

import { db } from '@/db';
import { plants, careLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from './auth';

export interface Plant {
  id: string;
  userId: string;
  name: string;
  nickname: string | null;
  wateringIntervalDays: number;
  createdAt: Date;
  lastWateredAt?: Date;
}

export interface CareLog {
  id: string;
  plantId: string;
  actionType: string;
  notes: string | null;
  loggedAt: Date;
}

// Stateful offline memory store in case of database absence
let mockPlants: Plant[] = [
  {
    id: 'plant-1',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Fiddle Leaf Fig',
    nickname: 'Figgy',
    wateringIntervalDays: 7,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastWateredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'plant-2',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Snake Plant',
    nickname: 'Stripy',
    wateringIntervalDays: 14,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastWateredAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'plant-3',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'Monstera Deliciosa',
    nickname: 'Monty',
    wateringIntervalDays: 6,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    lastWateredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
];

let mockCareLogs: CareLog[] = [
  {
    id: 'log-1',
    plantId: 'plant-1',
    actionType: 'water',
    notes: 'Soaked soil completely',
    loggedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-2',
    plantId: 'plant-2',
    actionType: 'water',
    notes: 'Subtle watering, soil was quite dry',
    loggedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-3',
    plantId: 'plant-3',
    actionType: 'water',
    notes: 'Misted leaves too',
    loggedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-4',
    plantId: 'plant-3',
    actionType: 'prune',
    notes: 'Trimmed yellowing bottom leaf',
    loggedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

// Helper to determine if DB is connected
async function runWithDrizzle<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<{ data: T; isMock: boolean }> {
  try {
    // If DATABASE_URL is mock or empty, bypass Drizzle entirely
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock-ref')) {
      return { data: await fallback(), isMock: true };
    }
    const data = await operation();
    return { data, isMock: false };
  } catch (error) {
    console.warn('Database connection failed. Falling back to offline in-memory storage.', error);
    return { data: await fallback(), isMock: true };
  }
}

export async function getPlants() {
  const user = await getCurrentUser();
  if (!user) return { data: [], isMock: true };

  return runWithDrizzle(
    async () => {
      const dbPlants = await db.select().from(plants).where(eq(plants.userId, user.id));
      // Map to include lastWateredAt dynamically from database logs
      const mapped = await Promise.all(
        dbPlants.map(async (p) => {
          const logs = await db
            .select()
            .from(careLogs)
            .where(eq(careLogs.plantId, p.id))
            .orderBy(desc(careLogs.loggedAt));
          const lastWater = logs.find((l) => l.actionType === 'water');
          return {
            ...p,
            lastWateredAt: lastWater ? lastWater.loggedAt : undefined,
          };
        })
      );
      return mapped as Plant[];
    },
    async () => {
      // Offline fallback: map in-memory data
      return mockPlants.map((p) => {
        const lastWater = mockCareLogs
          .filter((l) => l.plantId === p.id && l.actionType === 'water')
          .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())[0];
        return {
          ...p,
          lastWateredAt: lastWater ? lastWater.loggedAt : p.lastWateredAt,
        };
      });
    }
  );
}

export async function createPlant(name: string, nickname?: string, wateringIntervalDays: number = 7) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const newPlantData = {
    name,
    nickname: nickname || null,
    wateringIntervalDays,
    userId: user.id,
  };

  return runWithDrizzle(
    async () => {
      const inserted = await db.insert(plants).values(newPlantData).returning();
      return inserted[0] as Plant;
    },
    async () => {
      const offlinePlant: Plant = {
        id: `offline-plant-${Date.now()}`,
        userId: user.id,
        name,
        nickname: nickname || null,
        wateringIntervalDays,
        createdAt: new Date(),
      };
      mockPlants.unshift(offlinePlant);
      
      // Auto log a first default watering action to start tracking
      const initialLog: CareLog = {
        id: `offline-log-${Date.now()}`,
        plantId: offlinePlant.id,
        actionType: 'water',
        notes: 'Initial logging & watering',
        loggedAt: new Date(),
      };
      mockCareLogs.push(initialLog);
      
      return offlinePlant;
    }
  );
}

export async function deletePlant(plantId: string) {
  return runWithDrizzle(
    async () => {
      await db.delete(plants).where(eq(plants.id, plantId));
      return { success: true };
    },
    async () => {
      mockPlants = mockPlants.filter((p) => p.id !== plantId);
      mockCareLogs = mockCareLogs.filter((l) => l.plantId !== plantId);
      return { success: true };
    }
  );
}

export async function logCareAction(plantId: string, actionType: string, notes?: string) {
  const newLog = {
    plantId,
    actionType,
    notes: notes || null,
  };

  return runWithDrizzle(
    async () => {
      const inserted = await db.insert(careLogs).values(newLog).returning();
      return inserted[0] as CareLog;
    },
    async () => {
      const offlineLog: CareLog = {
        id: `offline-log-${Date.now()}`,
        plantId,
        actionType,
        notes: notes || null,
        loggedAt: new Date(),
      };
      mockCareLogs.push(offlineLog);
      
      // If we are watering, update mock lastWateredAt in the array
      if (actionType === 'water') {
        const plant = mockPlants.find(p => p.id === plantId);
        if (plant) {
          plant.lastWateredAt = offlineLog.loggedAt;
        }
      }

      return offlineLog;
    }
  );
}

export async function getCareLogs(plantId: string) {
  return runWithDrizzle(
    async () => {
      return await db
        .select()
        .from(careLogs)
        .where(eq(careLogs.plantId, plantId))
        .orderBy(desc(careLogs.loggedAt)) as CareLog[];
    },
    async () => {
      return mockCareLogs
        .filter((l) => l.plantId === plantId)
        .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
    }
  );
}
