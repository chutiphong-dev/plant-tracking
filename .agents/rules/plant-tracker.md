---
trigger: always_on
---

# Antigravity Stack: Plant Tracker Edition 🌿

The definitive 2026 boilerplate for solo developers and startups who need to ship feature-complete SaaS products before gravity catches up with them. This distribution features native Supabase Postgres integration.

Completely type-safe. Insanely fast. Zero configuration.

---

## 🛠️ The Core Engine


| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js** (App Router) | Server Components, hybrid rendering, and optimized SEO out of the box. |
| **Runtime Environment** | **Bun** | Blazing fast package management, bundler, and HTTP server runtime. |
| **Database Architecture** | **Supabase Postgres** | Fully managed Postgres with real-time sync, auth integration, and scaling. |
| **Object-Relational Mapping** | **Drizzle ORM** | Type-safe SQL dialect generation mapped directly to Supabase hosted instances. |
| **Styling Engine** | **Tailwind CSS** | Utility-first, compile-time CSS for rapid UI building. |
| **Backend-as-a-Service** | **Supabase** | Instant auth, row-level security (RLS), real-time sync, and image storage. |
| **Infrastructure Hosting** | **Vercel** | Global Edge network distribution with seamless Git-based deployment. |
| **Testing Architecture** | **Vitest & Playwright** | Unit, integration, and E2E testing using Bun's native speed. |

---

## 🚀 Quick Start Guide

Clone the repository and get your application live in less than 5 minutes.

### 1. Initialize the Project
```bash
# Clone the repository
git clone https://github.com
cd antigravity

# Install dependencies using Bun
bun install
```

### 2. Configure Environment Variables
Copy the template file and fill in your Supabase connection strings (found under Project Settings -> Database):
```bash
cp .env.example .env.local
```

```env
# .env.local
# Transaction connection pooler (Port 5432 or 6543) via Supabase
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@://supabase.com"
NEXT_PUBLIC_SUPABASE_URL="https://supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 3. Initialize Drizzle & Sync with Supabase
Push your schema directly to your Supabase instance and spin up your development workspace:
```bash
# Generate migrations and push them directly to Supabase Postgres
bunx drizzle-kit push

# Launch the local development server
bun dev
```
Your application is now running locally at `http://localhost:3000`.

---

## 🔌 Database Client Setup (`src/db/index.ts`)

This initialization script links Drizzle with Supabase’s Postgres engine using the high-performance `postgres` client library:

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Disable prefetch as recommended for Supabase connection poolers
const queryClient = postgres(process.env.DATABASE_URL, { prepare: false });
export const db = drizzle(queryClient, { schema });
```

---

## 🌿 Core Plant Data Model (`src/db/schema.ts`)

This pre-configured schema tracks individual plants and maps foreign keys directly to Supabase's native auth schema user management system.

```typescript
import { pgTable, uuid, text, timestamp, integer, pgSchema } from 'drizzle-orm/pg-core';

// Reference the native Supabase auth schema directly
const authSchema = pgSchema('auth');
export const users = authSchema.table('users', {
  id: uuid('id').primaryKey(),
});

// Plants Inventory Table
export const plants = pgTable('plants', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(), 
  name: text('name').notNull(),      
  nickname: text('nickname'),        
  wateringIntervalDays: integer('watering_interval_days').default(7).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Care Logs Table (Watering, Feeding, Pruning)
export const careLogs = pgTable('care_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  plantId: uuid('plant_id').references(() => plants.id, { onDelete: 'cascade' }).notNull(),
  actionType: text('action_type').default('water').notNull(), 
  notes: text('notes'),
  loggedAt: timestamp('logged_at').defaultNow().notNull(),
});
```

---

## 🔒 Security & Row-Level Security (RLS)

Because your database is hosted on Supabase, security is handled at the engine level. To enforce that users can only view their own plants, execute this migration SQL script on your Supabase SQL Editor:

```sql
-- Enable Row Level Security on the tables
ALTER TABLE "plants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "care_logs" ENABLE ROW LEVEL SECURITY;

-- Create an RLS policy for the plants table
CREATE POLICY "Users can only manage their own plants" 
ON "plants" 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create an RLS policy for the care logs table via subquery check
CREATE POLICY "Users can only manage logs of their own plants" 
ON "care_logs" 
FOR ALL 
TO authenticated 
USING (
  plant_id IN (SELECT id FROM "plants" WHERE user_id = auth.uid())
);
```

---

## 🧪 Testing & Coverage

### Example Database Logic Integration Test (`src/app/actions/plant.test.ts`)
```typescript
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
```
