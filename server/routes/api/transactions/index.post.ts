import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { transactions } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.type || !body.category || body.amount === undefined || !body.date) {
    throw createError({ statusCode: 400, message: 'Faltan campos requeridos' });
  }

  if (body.type !== 'Ingreso' && body.type !== 'Gasto') {
    throw createError({ statusCode: 400, message: 'Tipo inválido (debe ser Ingreso o Gasto)' });
  }

  const [newTransaction] = await db.insert(transactions).values({
    type: body.type,
    category: body.category,
    amount: body.amount.toString(),
    date: body.date,
    description: body.description,
  }).returning();

  return newTransaction;
});