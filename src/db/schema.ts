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
  category: text('category'), // e.g. 'ไม้ดอก', 'สมุนไพร', 'ไม้ใบ', 'ไม้ประดับ'
  fertilizerType: text('fertilizer_type'), // e.g. 'อินทรีย์ (0-0-0)', 'ดอก (8-24-24)', 'กลาง (16-16-16)'
  wateringIntervalDays: integer('watering_interval_days').default(7).notNull(),
  fertilizingIntervalDays: integer('fertilizing_interval_days').default(14).notNull(), // ความถี่ใส่ปุ๋ย
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
