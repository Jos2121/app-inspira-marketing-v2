import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("CRITICAL ERROR: La variable de entorno DATABASE_URL no está definida. El servidor no puede iniciar.");
}

const client = postgres(dbUrl);
export const db = drizzle(client, { schema });