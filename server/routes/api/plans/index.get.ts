import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { plans } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.select().from(plans).orderBy(desc(plans.createdAt));
});