import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { clientPlans } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.select().from(clientPlans).orderBy(desc(clientPlans.createdAt));
});