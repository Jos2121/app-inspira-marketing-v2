import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { requirements } from '../../../db/schema';
import { desc } from 'drizzle-orm';

export default defineHandler(async () => {
  return await db.query.requirements.findMany({
    with: {
      requester: true,
      assignee: true,
      client: true,
    },
    orderBy: [desc(requirements.createdAt)],
  });
});