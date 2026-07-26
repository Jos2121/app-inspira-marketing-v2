import { defineHandler } from 'nitro';
import { readBody, createError, getRouterParam } from 'nitro/h3';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });
  const body = await readBody(event);

  const [updated] = await db.update(partners).set({
    name: body.name,
    role: body.role,
    phone: body.phone,
    email: body.email,
    status: body.status,
    systemRole: body.systemRole,
    accessibleTabs: body.accessibleTabs,
  }).where(eq(partners.id, id)).returning();

  return updated;
});