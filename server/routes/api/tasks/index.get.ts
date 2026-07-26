import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { tasks } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.query.tasks.findMany({
    with: {
      partner: true,
      client: true,
    },
    orderBy: [desc(tasks.startTime)],
  });
});