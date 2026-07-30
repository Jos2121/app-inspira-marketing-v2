import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { objectives, objectiveTasks } from '../../../db/schema';
import { eq, and, notInArray } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID requerido' });

  const body = await readBody(event);

  if (!body.title || !body.clientId || !body.deadline || !Array.isArray(body.tasks)) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos o las tareas no son válidas' });
  }

  // 1. Actualizar el objetivo principal
  const [updatedObjective] = await db.update(objectives).set({
    title: body.title,
    clientId: body.clientId,
    deadline: body.deadline,
  }).where(eq(objectives.id, id)).returning();

  if (!updatedObjective) {
    throw createError({ statusCode: 404, message: 'Objetivo no encontrado' });
  }

  // 2. Sincronizar las tareas
  const incomingIds = body.tasks.map((t: any) => t.id).filter(Boolean);

  // Eliminar las tareas que ya no están en la nueva lista
  if (incomingIds.length > 0) {
    await db.delete(objectiveTasks).where(
      and(
        eq(objectiveTasks.objectiveId, id),
        notInArray(objectiveTasks.id, incomingIds)
      )
    );
  } else {
    await db.delete(objectiveTasks).where(eq(objectiveTasks.objectiveId, id));
  }

  // Insertar nuevas o actualizar existentes conservando su estado isCompleted
  for (const task of body.tasks) {
    if (task.id) {
      await db.update(objectiveTasks).set({
        title: task.title,
        partnerId: task.partnerId || null,
        deadline: task.deadline || null,
      }).where(eq(objectiveTasks.id, task.id));
    } else {
      await db.insert(objectiveTasks).values({
        objectiveId: id,
        title: task.title,
        partnerId: task.partnerId || null,
        deadline: task.deadline || null,
        isCompleted: false
      });
    }
  }

  return updatedObjective;
});