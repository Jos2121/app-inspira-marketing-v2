import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { objectives } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.query.objectives.findMany({
    with: {
      client: true,
      tasks: {
        with: {
          partner: true,
        },
      },
    },
    orderBy: [desc(objectives.createdAt)],
  });
});