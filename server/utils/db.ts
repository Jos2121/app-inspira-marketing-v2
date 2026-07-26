import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// Capturamos y validamos la variable de entorno bajo el principio Fail-Fast
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("CRITICAL ERROR: La variable de entorno DATABASE_URL no está definida. El servidor no puede iniciar.");
}

// This file is strictly for server-side use.
export const sql = neon(dbUrl);
export const db = drizzle(sql, { schema });