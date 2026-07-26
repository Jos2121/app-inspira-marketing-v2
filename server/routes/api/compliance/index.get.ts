import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { complianceRecords } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.query.complianceRecords.findMany({
    with: {
      client: true,
      plan: true,
    },
    orderBy: [desc(complianceRecords.createdAt)],
  });
});