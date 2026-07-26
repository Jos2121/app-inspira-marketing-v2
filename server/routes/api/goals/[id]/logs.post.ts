import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { dailyLogs } from '../../../../db/schema';

export default defineHandler(async (event) => {
  const goalId = getRouterParam(event, 'id');
  if (!goalId) throw createError({ statusCode: 400, message: 'Goal ID required' });

  const body = await readBody(event);
  if (!body.date || body.count === undefined) {
    throw createError({ statusCode: 400, message: 'Date and count required' });
  }

  const [newLog] = await db.insert(dailyLogs).values({
    goalId,
    date: body.date,
    count: body.count,
  }).returning();

  return newLog;
});