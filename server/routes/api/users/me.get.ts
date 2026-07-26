import { defineHandler } from 'nitro';
import { db } from '../../../utils/db';
import { appRoles, partners } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineHandler(async (event) => {
  const email = event.context.userEmail;
  if (!email) return { role: 'ADMIN', accessibleTabs: [] };

  let role = 'ADMIN';
  let accessibleTabs: string[] = [];

  // 1. Validar si es superadmin raíz (semilla)
  const roleRecord = await db.select().from(appRoles).where(eq(appRoles.email, email)).limit(1);
  if (roleRecord.length > 0) {
    role = roleRecord[0].role;
  }

  // 2. Validar permisos si el correo está registrado como Staff/Socio
  const partnerRecord = await db.select().from(partners).where(eq(partners.email, email)).limit(1);
  if (partnerRecord.length > 0) {
    if (role !== 'SUPERADMIN') {
      role = partnerRecord[0].systemRole;
    }
    accessibleTabs = partnerRecord[0].accessibleTabs;
  }

  // Si es superadmin tiene acceso a todas las pestañas por defecto
  if (role === 'SUPERADMIN') {
    accessibleTabs = ['*'];
  }

  return { role, accessibleTabs };
});