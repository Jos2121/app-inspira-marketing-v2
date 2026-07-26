import { defineHandler } from 'nitro';
import { getRequestHeaders, getRequestURL, readRawBody } from 'nitro/h3';

const FORWARDED_REQUEST_HEADERS = new Set([
  'accept',
  'accept-language',
  'authorization',
  'content-type',
  'cookie',
  'origin',
  'referer',
  'user-agent',
  'x-forwarded-for',
]);

export default defineHandler(async (event) => {
  const url = getRequestURL(event);
  const method = event.method;
  
  const upstreamPath = url.pathname.startsWith('/api/auth') 
    ? url.pathname.slice('/api/auth'.length) || '/' 
    : url.pathname;
    
  const upstreamUrl = `${process.env.NEON_AUTH_BASE_URL}${upstreamPath}${url.search}`;
  
  const forwardedHeaders = new Headers();
  const incomingHeaders = getRequestHeaders(event);
  
  for (const [key, value] of Object.entries(incomingHeaders)) {
    const headerName = key.toLowerCase();
    
    if (!value || !FORWARDED_REQUEST_HEADERS.has(headerName)) {
      continue;
    }
    
    forwardedHeaders.set(headerName, value as string);
  }
  
  // Undo cookie-name rewrite on the way up
  const cookieHeader = forwardedHeaders.get('cookie');
  if (cookieHeader) {
    const restoredCookie = cookieHeader
      .replaceAll('__Secure_', '__Secure-')
      .replaceAll('__Host_', '__Host-');
      
    if (restoredCookie) {
      forwardedHeaders.set('cookie', restoredCookie);
    } else {
      forwardedHeaders.delete('cookie');
    }
  }
  
  const body = method !== 'GET' && method !== 'HEAD' 
    ? await readRawBody(event, false) 
    : undefined;
    
  const upstream = await fetch(upstreamUrl, {
    method,
    headers: forwardedHeaders,
    body,
    redirect: 'manual',
  });
  
  const responseHeaders = new Headers();
  for (const [key, value] of upstream.headers.entries()) {
    if (key.toLowerCase() !== 'set-cookie') {
      responseHeaders.set(key, value);
    }
  }
  
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (let c of setCookies) {
    if (url.protocol === 'http:') {
      c = c.replaceAll('__Secure-', '__Secure_').replaceAll('__Host-', '__Host_');
      c = c.replaceAll('; Secure', '').replaceAll(';Secure', '')
           .replaceAll('; Partitioned', '').replaceAll(';Partitioned', '');
      c = c.replace(/;[ ]*Domain=[^;]*/gi, '');
      c = c.replaceAll('; SameSite=None', '; SameSite=Lax')
           .replaceAll(';SameSite=None', ';SameSite=Lax');
    }
    responseHeaders.append('set-cookie', c);
  }
  
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
});
