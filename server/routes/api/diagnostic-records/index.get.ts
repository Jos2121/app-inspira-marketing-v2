import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { diagnosticRecords } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.query.diagnosticRecords.findMany({
    with: {
      plan: true,
    },
    orderBy: [desc(diagnosticRecords.createdAt)],
  });
});