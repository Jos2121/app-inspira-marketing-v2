import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { agencyPlans } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.select().from(agencyPlans).orderBy(desc(agencyPlans.createdAt));
});