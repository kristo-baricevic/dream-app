let generation = 0;
let csrf: Promise<string> | undefined;
let acceptedPrincipal: { id: string; loginDeadline: string } | null = null;
const pending = new Set<AbortController>();
export const privateRequestGeneration = () => generation;
export function setRequestPrincipal(identity: { user: { id: string }; loginDeadline: string } | null) {
  acceptedPrincipal = identity ? { id: identity.user.id, loginDeadline: identity.loginDeadline } : null;
}

export function clearPrivateRequests() {
  generation += 1;
  csrf = undefined;
  acceptedPrincipal = null;
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
    if (!input.startsWith('/api/auth/')) {
      if (!acceptedPrincipal) throw new DOMException('Session unavailable', 'AbortError');
      // Captured mutation tickets may retain an older principal. Forward it so
      // the server rejects the operation rather than silently retargeting it.
      if (!forwarded.has('X-Dream-Principal')) forwarded.set('X-Dream-Principal', acceptedPrincipal.id);
      forwarded.set('X-Dream-Session', acceptedPrincipal.loginDeadline);
    }
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
    if (response.ok && response.status === 204 && !['GET', 'HEAD', 'OPTIONS'].includes(method) && input.startsWith('/api/')) {
      window.dispatchEvent(new Event('dream-private-data-changed'));
    }
    response.json = async () => {
      const payload = await originalJson();
      if (accepted !== generation) throw new DOMException('Session changed', 'AbortError');
      if (response.ok && !['GET', 'HEAD', 'OPTIONS'].includes(method) && input.startsWith('/api/') && !input.startsWith('/api/auth/')) {
        window.dispatchEvent(new Event('dream-private-data-changed'));
      }
      return payload;
    };
    return response;
  } finally {
    pending.delete(controller);
  }
}
