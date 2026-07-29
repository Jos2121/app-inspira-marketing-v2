import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { objectiveTasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID de la tarea requerido' });

  const body = await readBody(event);
  
  if (typeof body.isCompleted !== 'boolean') {
    throw createError({ statusCode: 400, message: 'isCompleted es requerido y debe ser un booleano' });
  }

  const [updatedTask] = await db.update(objectiveTasks)
    .set({ isCompleted: body.isCompleted })
    .where(eq(objectiveTasks.id, id))
    .returning();

  if (!updatedTask) {
    throw createError({ statusCode: 404, message: 'Tarea no encontrada' });
  }

  return updatedTask;
});