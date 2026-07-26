import { defineHandler } from 'nitro';
import { readBody, createError, getRequestURL } from 'nitro/h3';
import { db } from '../../../utils/db';
import { partners } from '../../../db/schema';

export default defineHandler(async (event) => {
  const body = await readBody(event);
  if (!body.name || !body.role) {
    throw createError({ statusCode: 400, message: 'Faltan campos obligatorios' });
  }

  // Si envían correo y contraseña (modo creación), registramos en Neon Auth
  if (body.email && body.password) {
    const url = getRequestURL(event);
    
    const authRes = await fetch(`${process.env.NEON_AUTH_BASE_URL}/sign-up/email`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': url.origin // Requerido por Better Auth por medidas de seguridad (CSRF)
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        name: body.name
      })
    });
    
    if (!authRes.ok) {
      const errorData = await authRes.json().catch(() => null);
      const errorMsg = errorData?.message || errorData?.error?.message || 'Verifica que la contraseña tenga mínimo 8 caracteres y el correo no exista.';
      
      throw createError({ 
        statusCode: 400, 
        message: `${errorMsg}` // Ahora mostrará el error exacto (ej. "Password must be at least 8 characters")
      });
    }
  }

  const [newPartner] = await db.insert(partners).values({
    name: body.name,
    role: body.role,
    phone: body.phone,
    email: body.email,
    status: body.status || 'Activo',
    systemRole: body.systemRole || 'ADMIN',
    accessibleTabs: body.accessibleTabs || [],
  }).returning();

  return newPartner;
});