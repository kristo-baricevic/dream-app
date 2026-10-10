import { NextRequest } from 'next/server';

export async function proxy(request: NextRequest, path: string[], service: 'api' | 'fastapi' | 'chat') {
  const base = service === 'api' ? process.env.DREAM_DJANGO_URL :
    service === 'fastapi' ? process.env.DREAM_ANALYZER_URL : process.env.DREAM_CHAT_URL;
  if (!base) return Response.json({ detail: 'Service unavailable.' }, { status: 503 });
  let destination: URL;
  try { destination = new URL(base); } catch { return Response.json({ detail: 'Invalid service configuration.' }, { status: 503 }); }
  if (!['http:', 'https:'].includes(destination.protocol) || destination.username || destination.password || destination.search || destination.hash ||
      (!['local', 'test'].includes(process.env.DREAM_ENV || '') && destination.protocol !== 'https:')) {
    return Response.json({ detail: 'Invalid service configuration.' }, { status: 503 });
  }
  if (path.some((part) => !part || part === '.' || part === '..' || /[\\/\x00]/.test(part))) {
    return Response.json({ detail: 'Invalid API path.' }, { status: 400 });
  }
  const headers = new Headers();
  for (const name of ['cookie', 'x-csrftoken', 'origin', 'referer', 'host', 'content-type', 'x-dream-principal', 'x-dream-session']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Incoming forwarded headers are discarded; service destinations are server configuration.
  // Enable only behind an edge that overwrites this header on every request.
  if (process.env.DREAM_EDGE_SETS_CLIENT_IP === '1') {
    const verified = request.headers.get('x-dream-client-ip');
    if (verified) headers.set('x-dream-client-ip', verified);
  }
  const url = base.replace(/\/$/, '') + (service === 'api' ? '/api/' : '/') + path.map(encodeURIComponent).join('/')
    + (service === 'api' || request.nextUrl.pathname.endsWith('/') ? '/' : '') + request.nextUrl.search;
  try {
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
    if (body && body.byteLength > 128000) return Response.json({ detail: 'Request too large.' }, { status: 413 });
    const upstream = await fetch(url, { method: request.method, headers, body,
      cache: 'no-store', redirect: 'manual', signal: request.signal });
    const outgoing = new Headers({ 'Cache-Control': 'no-store, private', 'Vary': 'Cookie' });
    for (const name of ['content-type', 'retry-after', 'x-dream-principal']) {
      const value = upstream.headers.get(name);
      if (value) outgoing.set(name, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) outgoing.append('set-cookie', cookie);
    if (upstream.status >= 300 && upstream.status < 400) return Response.json({ detail: 'Service redirect rejected.' }, { status: 502 });
    return new Response(upstream.body, { status: upstream.status, headers: outgoing });
  } catch {
    return Response.json({ detail: 'Service unavailable.' }, { status: 503,
      headers: { 'Cache-Control': 'no-store, private' } });
  }
}
