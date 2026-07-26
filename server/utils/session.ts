import { db } from './db';
import { appRoles, partners } from '../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from './auth';
import { H3Event } from 'nitro';
import { toWebRequest } from 'h3';

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

export async function getSession(event: H3Event): Promise<Session> {
  try {
    const request = toWebRequest(event);
    const sessionData = await auth.api.getSession({
      headers: request.headers
    });
    
    if (!sessionData?.user) return null;
    
    let role = 'ADMIN';
    let accessibleTabs: string[] = [];

    const roleRecord = await db.select().from(appRoles).where(eq(appRoles.email, sessionData.user.email)).limit(1);
    if (roleRecord.length > 0) {
      role = roleRecord[0].role;
    }
    
    const partnerRecord = await db.select().from(partners).where(eq(partners.email, sessionData.user.email)).limit(1);
    if (partnerRecord.length > 0) {
      if (role !== 'SUPERADMIN') {
        role = partnerRecord[0].systemRole;
      }
      accessibleTabs = partnerRecord[0].accessibleTabs;
    }

    if (role === 'SUPERADMIN') {
      accessibleTabs = ['*'];
    }
    
    return {
      user: {
        ...sessionData.user,
        role,
        accessibleTabs
      }
    };
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}