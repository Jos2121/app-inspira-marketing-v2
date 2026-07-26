import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { agencyPlans } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  
  if (!body.name || !body.price || !body.benefits) {
    throw createError({ statusCode: 400, message: 'Faltan datos requeridos' });
  }

  try {
    const [updated] = await db.update(agencyPlans).set({
      name: body.name,
      price: body.price.toString(),
      benefits: body.benefits,
    }).where(eq(agencyPlans.id, id)).returning();

    if (!updated) {
      throw createError({ statusCode: 404, message: 'Plan no encontrado' });
    }

    return updated;
  } catch (error) {
    console.error('Error updating agency plan:', error);
    throw createError({ statusCode: 500, message: 'Error interno del servidor al actualizar el plan' });
  }
});