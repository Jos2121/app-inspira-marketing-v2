import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { createError, getRouterParam } from 'nitro/h3';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  await db.delete(partners).where(eq(partners.id, id));
  return { success: true };
});