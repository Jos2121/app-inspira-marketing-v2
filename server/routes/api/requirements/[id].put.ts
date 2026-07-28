import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { requirements } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  const { content, requesterId, assigneeId, deadline, status } = body;

  const [updated] = await db.update(requirements).set({
    content,
    requesterId,
    assigneeId,
    deadline,
    status: status || 'Pendiente'
  }).where(eq(requirements.id, id)).returning();

  if (!updated) {
    throw createError({ statusCode: 404, message: 'Requerimiento no encontrado' });
  }

  return updated;
});