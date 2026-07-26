import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../../utils/db';
import { workflowTasks } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody<{ items: { id: string; partnerId: string | null; orderIndex: number }[] }>(event);
  
  if (!body.items || !Array.isArray(body.items)) {
    throw createError({ statusCode: 400, message: 'Estructura inválida' });
  }

  for (const item of body.items) {
    await db.update(workflowTasks)
      .set({ partnerId: item.partnerId, orderIndex: item.orderIndex })
      .where(eq(workflowTasks.id, item.id));
  }

  return { success: true };
});