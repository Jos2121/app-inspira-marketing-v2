import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.select().from(partners).orderBy(desc(partners.createdAt));
});