import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { diagnosticQuestions } from '../../../db/schema';

export default defineHandler(async (event) => {
  try {
    const body = await readBody(event);
    if (!body || !body.question) {
      throw createError({ statusCode: 400, message: 'La pregunta es requerida' });
    }

    const [newQuestion] = await db.insert(diagnosticQuestions).values({
      question: body.question,
    }).returning();

    return newQuestion;
  } catch (error: any) {
    console.error("Error insertando checklist:", error);
    throw createError({ statusCode: 500, message: error.message || 'Error interno del servidor al crear el ítem' });
  }
});