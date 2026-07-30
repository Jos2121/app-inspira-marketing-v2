import { defineHandler } from 'nitro';
import { readBody, createError } from 'nitro/h3';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';
import { auth } from '../../../utils/auth';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.role) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' });
  }

  if (body.email && body.password) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.name
        }
      });
      if (res && 'error' in res && res.error) {
        throw new Error(res.error.message);
      }
    } catch (err: any) {
      throw createError({ 
        statusCode: 400, 
        message: err.message || 'Verifica que la contraseña tenga mínimo 8 caracteres y el correo no exista.'
      });
    }
  }

  const [newPartner] = await db.insert(partners).values({
    name: body.name,
    role: body.role,
    phone: body.phone,
    email: body.email,
    telegramChatId: body.telegramChatId || null,
    status: body.status || 'Activo',
    systemRole: body.systemRole || 'ADMIN',
    accessibleTabs: body.accessibleTabs || [],
    color: body.color || '#3b82f6',
  }).returning();

  return newPartner;
});