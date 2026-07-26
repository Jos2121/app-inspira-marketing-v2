import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { clients } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async (event) => {
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
});
