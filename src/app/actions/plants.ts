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
  category: string | null;
  fertilizerType: string | null;
  wateringIntervalDays: number;
  fertilizingIntervalDays: number;
  createdAt: Date;
  lastWateredAt?: Date;
  lastFertilizedAt?: Date;
}

export interface CareLog {
  id: string;
  plantId: string;
  actionType: string;
  notes: string | null;
  loggedAt: Date;
}

// Current date base for mock data (2026-05-18)
const today = new Date('2026-05-18T12:00:00Z');
const daysAgo = (days: number) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

// Stateful offline memory store pre-populated with the user's exact plants from the spreadsheet!
let mockPlants: Plant[] = [
  {
    id: 'plant-1',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'เดซี่ 1',
    nickname: 'Daisy One',
    category: 'ไม้ดอก',
    fertilizerType: 'อินทรีย์ (0-0-0)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 21,
    createdAt: daysAgo(30),
  },
  {
    id: 'plant-2',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'เดซี่ 2',
    nickname: 'Daisy Two',
    category: 'ไม้ดอก',
    fertilizerType: 'อินทรีย์ (0-0-0)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 21,
    createdAt: daysAgo(30),
  },
  {
    id: 'plant-3',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'กุหลาบพุ่มเล็ก',
    nickname: 'Little Bush Rose',
    category: 'ไม้ดอก',
    fertilizerType: 'ดอก (8-24-24)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 10,
    createdAt: daysAgo(20),
  },
  {
    id: 'plant-4',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'แพรเซี่ยงไฮ้',
    nickname: 'Moss Rose',
    category: 'ไม้ดอก',
    fertilizerType: 'กลาง (16-16-16)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(20),
  },
  {
    id: 'plant-5',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'โรสแมรี่',
    nickname: 'Rosemary',
    category: 'สมุนไพร',
    fertilizerType: 'กลาง (16-16-16)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(25),
  },
  {
    id: 'plant-6',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'เบญจมาศเงิน',
    nickname: 'Crossostephium',
    category: 'ไม้ดอก',
    fertilizerType: 'ดอก (8-24-24)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 10,
    createdAt: daysAgo(25),
  },
  {
    id: 'plant-7',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'บานชื่นแคระ',
    nickname: 'Dwarf Zinnia',
    category: 'ไม้ดอก',
    fertilizerType: 'กลาง (16-16-16)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(15),
  },
  {
    id: 'plant-8',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'มะลิ',
    nickname: 'Jasmine',
    category: 'ไม้ดอก',
    fertilizerType: 'ดอก (8-24-24)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 10,
    createdAt: daysAgo(15),
  },
  {
    id: 'plant-9',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'หลิวไต้หวัน',
    nickname: 'False Heather',
    category: 'ไม้ประดับ',
    fertilizerType: 'กลาง (16-16-16)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(18),
  },
  {
    id: 'plant-10',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'หัวใจเศรษฐี',
    nickname: 'Ficus Variegata',
    category: 'ไม้ใบ',
    fertilizerType: 'กลาง (16-16-16)',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(18),
  },
  {
    id: 'plant-11',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'กระเพรา (เพาะ)',
    nickname: 'Holy Basil',
    category: 'สมุนไพร',
    fertilizerType: 'ยังไม่ใส่',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(5),
  },
  {
    id: 'plant-12',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'โหระพา (เพาะ)',
    nickname: 'Sweet Basil',
    category: 'สมุนไพร',
    fertilizerType: 'ยังไม่ใส่',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(5),
  },
  {
    id: 'plant-13',
    userId: '00000000-0000-0000-0000-000000000001',
    name: 'กุหลาบมงมาร์ต',
    nickname: 'Montmartre Rose',
    category: 'ไม้ดอก',
    fertilizerType: 'ยังไม่ใส่',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 14,
    createdAt: daysAgo(2),
  },
];

let mockCareLogs: CareLog[] = [
  // Daisy 1 & 2 Fertilized on 2026-05-07 (11 days ago)
  { id: 'log-f1', plantId: 'plant-1', actionType: 'feed', notes: 'อินทรีย์ (0-0-0)', loggedAt: daysAgo(11) },
  { id: 'log-w1', plantId: 'plant-1', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(4) },
  
  { id: 'log-f2', plantId: 'plant-2', actionType: 'feed', notes: 'อินทรีย์ (0-0-0)', loggedAt: daysAgo(11) },
  { id: 'log-w2', plantId: 'plant-2', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(4) },

  // Small bush rose: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f3', plantId: 'plant-3', actionType: 'feed', notes: 'ดอก (8-24-24)', loggedAt: daysAgo(4) },
  { id: 'log-w3', plantId: 'plant-3', actionType: 'water', notes: 'Moistened soil', loggedAt: daysAgo(2) },

  // Moss Rose: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f4', plantId: 'plant-4', actionType: 'feed', notes: 'กลาง (16-16-16)', loggedAt: daysAgo(4) },
  { id: 'log-w4', plantId: 'plant-4', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(2) },

  // Rosemary: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f5', plantId: 'plant-5', actionType: 'feed', notes: 'กลาง (16-16-16)', loggedAt: daysAgo(4) },
  { id: 'log-w5', plantId: 'plant-5', actionType: 'water', notes: 'Keep slightly dry', loggedAt: daysAgo(3) },

  // Crossostephium: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f6', plantId: 'plant-6', actionType: 'feed', notes: 'ดอก (8-24-24)', loggedAt: daysAgo(4) },
  { id: 'log-w6', plantId: 'plant-6', actionType: 'water', notes: 'Well drained watering', loggedAt: daysAgo(2) },

  // Dwarf Zinnia: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f7', plantId: 'plant-7', actionType: 'feed', notes: 'กลาง (16-16-16)', loggedAt: daysAgo(4) },
  { id: 'log-w7', plantId: 'plant-7', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(2) },

  // Jasmine: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f8', plantId: 'plant-8', actionType: 'feed', notes: 'ดอก (8-24-24)', loggedAt: daysAgo(4) },
  { id: 'log-w8', plantId: 'plant-8', actionType: 'water', notes: 'Thoroughly watered', loggedAt: daysAgo(1) },

  // False Heather: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f9', plantId: 'plant-9', actionType: 'feed', notes: 'กลาง (16-16-16)', loggedAt: daysAgo(4) },
  { id: 'log-w9', plantId: 'plant-9', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(3) },

  // Ficus: Feed on 2026-05-14 (4 days ago)
  { id: 'log-f10', plantId: 'plant-10', actionType: 'feed', notes: 'กลาง (16-16-16)', loggedAt: daysAgo(4) },
  { id: 'log-w10', plantId: 'plant-10', actionType: 'water', notes: 'Regular watering', loggedAt: daysAgo(4) },
];

// Helper to determine if DB is connected
async function runWithDrizzle<T>(operation: () => Promise<T>, fallback: () => Promise<T>): Promise<{ data: T; isMock: boolean }> {
  try {
    // If DATABASE_URL is mock or empty, bypass Drizzle entirely
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('mock-ref') || process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
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
      // Map to include lastWateredAt and lastFertilizedAt dynamically from database logs
      const mapped = await Promise.all(
        dbPlants.map(async (p) => {
          const logs = await db
            .select()
            .from(careLogs)
            .where(eq(careLogs.plantId, p.id))
            .orderBy(desc(careLogs.loggedAt));
          
          const lastWater = logs.find((l) => l.actionType === 'water');
          const lastFertilizer = logs.find((l) => l.actionType === 'feed');
          
          return {
            ...p,
            lastWateredAt: lastWater ? lastWater.loggedAt : undefined,
            lastFertilizedAt: lastFertilizer ? lastFertilizer.loggedAt : undefined,
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
        
        const lastFertilizer = mockCareLogs
          .filter((l) => l.plantId === p.id && l.actionType === 'feed')
          .sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime())[0];

        return {
          ...p,
          lastWateredAt: lastWater ? lastWater.loggedAt : undefined,
          lastFertilizedAt: lastFertilizer ? lastFertilizer.loggedAt : undefined,
        };
      });
    }
  );
}

export async function createPlant(
  name: string,
  nickname?: string,
  category?: string,
  fertilizerType?: string,
  wateringIntervalDays: number = 7,
  fertilizingIntervalDays: number = 14
) {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');

  const newPlantData = {
    name,
    nickname: nickname || null,
    category: category || null,
    fertilizerType: fertilizerType || 'ยังไม่ใส่',
    wateringIntervalDays,
    fertilizingIntervalDays,
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
        category: category || null,
        fertilizerType: fertilizerType || 'ยังไม่ใส่',
        wateringIntervalDays,
        fertilizingIntervalDays,
        createdAt: new Date(),
      };
      mockPlants.unshift(offlinePlant);
      
      // Auto log a first default watering and feeding action to start tracking if fertilizer is set
      const initialLog: CareLog = {
        id: `offline-log-${Date.now()}`,
        plantId: offlinePlant.id,
        actionType: 'water',
        notes: 'Initial tracking',
        loggedAt: new Date(),
      };
      mockCareLogs.push(initialLog);

      if (fertilizerType && fertilizerType !== 'ยังไม่ใส่') {
        const initialFeedLog: CareLog = {
          id: `offline-feed-log-${Date.now()}`,
          plantId: offlinePlant.id,
          actionType: 'feed',
          notes: `ใส่ปุ๋ยสูตร: ${fertilizerType}`,
          loggedAt: new Date(),
        };
        mockCareLogs.push(initialFeedLog);
      }
      
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
      
      // Update in-memory reference
      const plant = mockPlants.find(p => p.id === plantId);
      if (plant) {
        if (actionType === 'water') {
          plant.lastWateredAt = offlineLog.loggedAt;
        } else if (actionType === 'feed') {
          plant.lastFertilizedAt = offlineLog.loggedAt;
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
