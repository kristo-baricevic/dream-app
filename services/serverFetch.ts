import 'server-only';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function serverFetch(path: string, init: RequestInit = {}) {
  const base = process.env.DREAM_DJANGO_URL;
  if (!base || !path.startsWith('/api/') || path.includes('..')) throw new Error('Backend URL required');
  if (!['local', 'test'].includes(process.env.DREAM_ENV || '') && new URL(base).protocol !== 'https:') throw new Error('Production service URL requires HTTPS');
  const incoming = await headers();
  const forwarded = new Headers(init.headers);
  for (const name of ['cookie', 'host', 'origin', 'referer', 'x-csrftoken']) {
    const value = incoming.get(name); if (value) forwarded.set(name, value);
  }
  const response = await fetch(base.replace(/\/$/, '') + path,
    { ...init, headers: forwarded, cache: 'no-store', redirect: 'manual' });
  if (response.status === 401) redirect('/login');
  return response;
}
