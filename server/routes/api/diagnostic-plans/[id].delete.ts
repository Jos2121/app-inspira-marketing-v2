import { defineHandler } from 'nitro';
import { createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { agencyPlans } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  await db.delete(agencyPlans).where(eq(agencyPlans.id, id));
  return { success: true };
});