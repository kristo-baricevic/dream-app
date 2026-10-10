let generation = 0;
let csrf: Promise<string> | undefined;
const pending = new Set<AbortController>();

export function clearPrivateRequests() {
  generation += 1;
  csrf = undefined;
  pending.forEach((controller) => controller.abort());
  pending.clear();
}

export async function apiFetch(input: string, init: RequestInit = {}) {
  if (!input.startsWith('/') || input.startsWith('//')) throw new Error('Invalid API path');
  if (typeof window === 'undefined') throw new Error('Use authenticated serverFetch on the server');
  const accepted = generation;
  const controller = new AbortController();
  pending.add(controller);
  const forwarded = new Headers(init.headers);
  const method = (init.method || 'GET').toUpperCase();
  try {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      csrf ??= fetch('/api/auth/csrf/', { credentials: 'same-origin', cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('Unable to establish session');
          return (await response.json()).csrfToken as string;
        }).catch((error) => { csrf = undefined; throw error; });
      forwarded.set('X-CSRFToken', await csrf);
    }
    if (accepted !== generation) throw new DOMException('Session changed', 'AbortError');
    const response = await fetch(input, { ...init, headers: forwarded, credentials: 'same-origin',
      cache: 'no-store', signal: controller.signal });
    if (accepted !== generation) throw new DOMException('Session changed', 'AbortError');
    if (response.status === 401 && !input.startsWith('/api/auth/login/')) {
      clearPrivateRequests();
      window.dispatchEvent(new Event('dream-session-invalid'));
    }
    const originalJson = response.json.bind(response);
    response.json = async () => {
      const payload = await originalJson();
      if (accepted !== generation) throw new DOMException('Session changed', 'AbortError');
      return payload;
    };
    return response;
  } finally {
    pending.delete(controller);
  }
}
