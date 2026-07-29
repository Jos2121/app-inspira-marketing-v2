import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { clients } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.query.clients.findMany({
    with: {
      plan: true,
    },
    orderBy: [desc(clients.createdAt)],
  });
});