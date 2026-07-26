import { db } from './db';
import { appRoles, partners } from '../db/schema';
import { eq } from 'drizzle-orm';

export type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role?: string;
    accessibleTabs?: string[];
  };
} | null;

export async function getSessionFromCookie(cookieHeader: string | null): Promise<Session> {
  if (!cookieHeader) return null;
  
  const cookie = cookieHeader
    .replaceAll('__Secure_', '__Secure-')
    .replaceAll('__Host_', '__Host-');
    
  if (!cookie) return null;
  
  try {
    const res = await fetch(`${process.env.NEON_AUTH_BASE_URL}/get-session`, {
      headers: { cookie },
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data?.user) return null;
    
    const session: Session = data;
    
    let role = 'ADMIN';
    let accessibleTabs: string[] = [];

    // Validar si es superadmin raíz (semilla)
    const roleRecord = await db.select().from(appRoles).where(eq(appRoles.email, session.user.email)).limit(1);
    if (roleRecord.length > 0) {
      role = roleRecord[0].role;
    }
    
    // Validar permisos si el correo está registrado como Staff/Socio
    const partnerRecord = await db.select().from(partners).where(eq(partners.email, session.user.email)).limit(1);
    if (partnerRecord.length > 0) {
      if (role !== 'SUPERADMIN') {
        role = partnerRecord[0].systemRole;
      }
      accessibleTabs = partnerRecord[0].accessibleTabs;
    }

    // Si es superadmin tiene acceso total
    if (role === 'SUPERADMIN') {
      accessibleTabs = ['*'];
    }
    
    session.user.role = role;
    session.user.accessibleTabs = accessibleTabs;
    
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}