import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { diagnosticRecords } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.prospectName || !body.results || !body.reportText) {
    throw createError({ statusCode: 400, message: 'Faltan datos obligatorios' });
  }

  const [newRecord] = await db.insert(diagnosticRecords).values({
    prospectName: body.prospectName,
    prospectWhatsapp: body.prospectWhatsapp || '',
    dateLimaISO: body.dateLimaISO,
    results: body.results,
    reportText: body.reportText,
    planId: body.planId || null,
  }).returning();

  return newRecord;
});