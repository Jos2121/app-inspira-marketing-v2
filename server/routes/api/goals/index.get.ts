import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { goals } from '../../../db/schema';

export default defineHandler(async (event) => {
  return await db.query.goals.findMany({
    with: {
      dailyLogs: true,
    },
    orderBy: [desc(goals.createdAt)],
  });
});