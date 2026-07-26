import { defineHandler } from 'nitro';
import { createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { plans } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  try {
    await db.delete(plans).where(eq(plans.id, id));
    return { success: true };
  } catch (error: any) {
    throw createError({ statusCode: 400, message: 'No se puede eliminar el plan porque está en uso.' });
  }
});