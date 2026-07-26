import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { tasks } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.title || !body.startTime || !body.endTime) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' });
  }

  const [newTask] = await db.insert(tasks).values({
    title: body.title,
    description: body.description,
    startTime: body.startTime,
    endTime: body.endTime,
    partnerId: body.partnerId || null,
    clientId: body.clientId || null,
    status: body.status || 'Pendiente',
  }).returning();

  return newTask;
});