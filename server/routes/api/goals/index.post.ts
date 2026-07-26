import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { goals } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.clientId || !body.monthYear || !body.targetPatients || !body.costPerPatient) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos' });
  }

  const [newGoal] = await db.insert(goals).values({
    clientId: body.clientId,
    monthYear: body.monthYear,
    targetPatients: body.targetPatients,
    costPerPatient: body.costPerPatient.toString(),
  }).returning();

  return newGoal;
});