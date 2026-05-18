import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.mock-ref:mock-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true';

// Disable prefetch as recommended for Supabase connection poolers
const queryClient = postgres(connectionString, { prepare: false });
export const db = drizzle(queryClient, { schema });
