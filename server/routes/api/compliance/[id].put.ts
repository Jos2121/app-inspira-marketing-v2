import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { complianceRecords } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });
  
  const body = await readBody(event);
  if (!body.checklist) throw createError({ statusCode: 400, message: 'Checklist required' });

  const [updated] = await db.update(complianceRecords).set({
    checklist: body.checklist,
  }).where(eq(complianceRecords.id, id)).returning();

  return updated;
});