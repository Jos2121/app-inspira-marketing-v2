import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { clientPlans } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.name) {
    throw createError({ statusCode: 400, message: 'Name is required' });
  }

  const [newPlan] = await db.insert(clientPlans).values({
    name: body.name,
    benefits: body.benefits || [],
  }).returning();

  return newPlan;
});