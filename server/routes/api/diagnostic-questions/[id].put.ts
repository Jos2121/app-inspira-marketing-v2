import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { diagnosticQuestions } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  const body = await readBody(event);
  if (!body || !body.question) {
    throw createError({ statusCode: 400, message: 'La pregunta es requerida' });
  }

  try {
    const [updated] = await db.update(diagnosticQuestions)
      .set({ question: body.question })
      .where(eq(diagnosticQuestions.id, id))
      .returning();

    if (!updated) {
      throw createError({ statusCode: 404, message: 'Ítem no encontrado' });
    }

    return updated;
  } catch (error: any) {
    console.error("Error actualizando checklist:", error);
    throw createError({ statusCode: 500, message: 'Error interno del servidor al actualizar el ítem' });
  }
});