import { defineHandler } from 'nitro';
import { getRouterParam, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { taskUpdates } from '../../../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const taskId = getRouterParam(event, 'id');
  if (!taskId) throw createError({ statusCode: 400, message: 'Falta el ID de la tarea' });
  
  const updates = await db.query.taskUpdates.findMany({
    where: eq(taskUpdates.taskId, taskId),
    orderBy: [desc(taskUpdates.createdAt)]
  });
  
  return updates;
});