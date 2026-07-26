import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { agencyPlans } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.price || !body.benefits || !Array.isArray(body.benefits)) {
    throw createError({ statusCode: 400, message: 'Datos de plan inválidos' });
  }

  const [newPlan] = await db.insert(agencyPlans).values({
    name: body.name,
    price: body.price.toString(),
    benefits: body.benefits,
  }).returning();

  return newPlan;
});