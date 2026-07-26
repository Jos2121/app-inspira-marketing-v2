import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { clients } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  
  if (!body.name) {
    throw createError({ statusCode: 400, message: 'Name is required' });
  }

  const [updatedClient] = await db.update(clients).set({
    name: body.name,
    phone: body.phone,
  }).where(eq(clients.id, id)).returning();

  return updatedClient;
});