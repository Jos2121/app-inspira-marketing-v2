import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { tasks } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });
  const body = await readBody(event);

  const [updated] = await db.update(tasks).set({
    title: body.title,
    description: body.description,
    startTime: body.startTime,
    endTime: body.endTime,
    partnerId: body.partnerId || null,
    clientId: body.clientId || null,
    status: body.status,
  }).where(eq(tasks.id, id)).returning();

  return updated;
});