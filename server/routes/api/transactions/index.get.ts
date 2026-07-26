import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { desc } from 'drizzle-orm';
import { transactions } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.query.transactions.findMany({
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  });
});