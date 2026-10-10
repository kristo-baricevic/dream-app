export function safeNextPath(next: string | null, origin: string) {
  if (!next || !next.startsWith('/') || next.startsWith('//') || /[\\\u0000-\u0020\u007f]/.test(next)) return '/journal';
  try {
    const destination = new URL(next, origin);
    const current = new URL(origin);
    if (destination.origin !== current.origin || destination.protocol !== current.protocol) return '/journal';
    return destination.pathname + destination.search + destination.hash;
  } catch { return '/journal'; }
}
