import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { plans } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.activities || !Array.isArray(body.activities)) {
    throw createError({ statusCode: 400, message: 'Datos de plan inválidos' });
  }

  const [newPlan] = await db.insert(plans).values({
    name: body.name,
    activities: body.activities,
  }).returning();

  return newPlan;
});