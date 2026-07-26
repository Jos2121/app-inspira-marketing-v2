import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { asc } from 'drizzle-orm';
import { diagnosticQuestions } from '../../../db/schema';

export default defineHandler(async () => {
  return await db.select().from(diagnosticQuestions).orderBy(asc(diagnosticQuestions.createdAt));
});