import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { transactions } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' });

  await db.delete(transactions).where(eq(transactions.id, id));
  return { success: true };
});