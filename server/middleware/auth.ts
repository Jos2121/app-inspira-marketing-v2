import { defineHandler } from 'nitro';
import { createError, getRequestHeader, getRequestURL } from 'nitro/h3';
import { getSessionFromCookie } from '../utils/session';

const PUBLIC_PREFIXES = ['/api/auth/', '/auth/'];

export default defineHandler(async (event) => {
  const url = getRequestURL(event);
  const pathname = url.pathname;
  
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return;
  }
  
  if (!pathname.startsWith('/api/')) {
    return;
  }
  
  const cookie = getRequestHeader(event, 'cookie') ?? null;
  const session = await getSessionFromCookie(cookie);
  
  if (!session?.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  const role = session.user.role || 'ADMIN';
  const accessibleTabs = session.user.accessibleTabs || [];
  const isSuperadmin = role === 'SUPERADMIN' || accessibleTabs.includes('*');
  const method = event.method;

  // RBAC por módulos API
  if (!isSuperadmin) {
    // Permitir lectura (GET) de staff para dropdowns de tareas, bloquear modificaciones (POST, PUT, DELETE)
    if (pathname.startsWith('/api/partners') && method !== 'GET') {
      throw createError({ statusCode: 403, statusMessage: 'No tienes permiso para modificar el staff' });
    }

    const routeMap: Record<string, string> = {
      '/api/dashboard': '/',
      '/api/tasks': '/calendar',
      '/api/goals': '/goals',
      '/api/daily-logs': '/goals',
      '/api/compliance': '/compliance',
      '/api/plans': '/compliance',
      '/api/transactions': '/finance',
      '/api/clients': '/clients',
      '/api/diagnostic': '/diagnostic',
      '/api/workflows': '/workflows',
    };

    for (const [apiPath, tabId] of Object.entries(routeMap)) {
      if (pathname.startsWith(apiPath) && !accessibleTabs.includes(tabId) && !accessibleTabs.includes('/')) {
        throw createError({ statusCode: 403, statusMessage: `No tienes permisos para acceder a este recurso.` });
      }
    }
  }

  if (method === 'DELETE') {
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      throw createError({ statusCode: 403, statusMessage: `Acceso denegado: El rol '${role}' no tiene permisos para eliminar registros` });
    }
  }
  
  event.context.userId = session.user.id;
  event.context.userRole = role;
  event.context.userEmail = session.user.email;
});