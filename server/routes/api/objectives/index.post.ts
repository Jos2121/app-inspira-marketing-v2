import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { objectives, objectiveTasks } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.title || !body.clientId || !body.deadline || !body.tasks || !Array.isArray(body.tasks)) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos o las tareas no son válidas' });
  }

  // 1. Insertamos el objetivo
  const [newObjective] = await db.insert(objectives).values({
    title: body.title,
    clientId: body.clientId,
    deadline: body.deadline,
  }).returning();

  // 2. Insertamos sus tareas si se enviaron
  if (body.tasks.length > 0) {
    const tasksToInsert = body.tasks.map((task: any) => ({
      objectiveId: newObjective.id,
      title: task.title,
      partnerId: task.partnerId || null,
      isCompleted: false
    }));
    await db.insert(objectiveTasks).values(tasksToInsert);
  }

  return newObjective;
});