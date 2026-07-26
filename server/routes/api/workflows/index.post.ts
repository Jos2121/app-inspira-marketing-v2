import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { workflows } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name) {
    throw createError({ statusCode: 400, message: 'El nombre es obligatorio' });
  }

  const [newWorkflow] = await db.insert(workflows).values({
    name: body.name,
  }).returning();

  return newWorkflow;
});