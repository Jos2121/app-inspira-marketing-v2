import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { complianceRecords, plans } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.clientId || !body.planId || !body.monthYear) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' });
  }

  // Buscar el plan para inicializar el checklist
  const [plan] = await db.select().from(plans).where(eq(plans.id, body.planId));
  if (!plan) throw createError({ statusCode: 404, message: 'Plan no encontrado' });

  const checklist: Record<string, boolean> = {};
  (plan.activities as string[]).forEach(act => {
    checklist[act] = false;
  });

  const [newRecord] = await db.insert(complianceRecords).values({
    clientId: body.clientId,
    planId: body.planId,
    monthYear: body.monthYear,
    checklist,
  }).returning();

  return newRecord;
});