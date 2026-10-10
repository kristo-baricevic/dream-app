'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/redux/store';
import { apiFetch, clearPrivateRequests, setRequestPrincipal } from '@/services/apiFetch';
import { usePathname, useRouter } from 'next/navigation';

type User = { id: string; username: string; isAdmin: boolean };
type Identity = { user: User; loginDeadline: string; contextFence?: unknown };
const Auth = createContext<{ user: User | null; loading: boolean; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void> } | null>(null);
export const useAuth = () => { const context = useContext(Auth); if (!context) throw new Error('Authentication provider required'); return context; };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(() => makeStore());
  const version = useRef(0);
  const identityRef = useRef<Identity | null>(null);
  const transitioning = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const privateChannel = useRef<BroadcastChannel | null>(null);
  const replace = (next: Identity | null) => {
    version.current += 1;
    clearPrivateRequests();
    setRequestPrincipal(next);
    identityRef.current = next;
    setIdentity(next); setStore(makeStore()); setLoading(false);
  };
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      if (transitioning.current) return;
      const accepted = version.current;
      try {
        const response = await apiFetch('/api/auth/session/');
        const data = response.ok ? await response.json() : null;
        if (!active || accepted !== version.current) return;
        const priorFence = identityRef.current;
        if (priorFence && data && priorFence.user.id === data.user.id &&
            JSON.stringify(priorFence.contextFence) !== JSON.stringify(data.contextFence)) {
          clearPrivateRequests(); setStore(makeStore());
          window.location.reload();
          return;
        }
        const prior = identityRef.current;
        if (prior?.user.id !== data?.user.id || prior?.loginDeadline !== data?.loginDeadline) {
          clearPrivateRequests(); setStore(makeStore());
          if (prior && data && prior.user.id !== data.user.id) {
            identityRef.current = null; setIdentity(null); setLoading(true);
            window.location.replace('/journal');
            return;
          }
        }
        setRequestPrincipal(data);
        identityRef.current = data;
        setIdentity(data);
        setLoading(false);
      } catch { if (active && accepted === version.current) replace(null); }
    };
    const invalidate = () => {
      const hadIdentity = identityRef.current !== null;
      replace(null);
      if (hadIdentity) window.location.replace('/login');
    };
    channel.current = new BroadcastChannel('dream-auth');
    channel.current.onmessage = () => { replace(null); window.location.replace('/journal'); };
    const dataChanged = () => {
      version.current += 1;
      clearPrivateRequests(); setLoading(true);
      privateChannel.current?.postMessage('changed');
      void refresh();
    };
    privateChannel.current = new BroadcastChannel('dream-private-data');
    privateChannel.current.onmessage = () => {
      version.current += 1;
      clearPrivateRequests(); setLoading(true);
      void refresh();
    };
    window.addEventListener('dream-session-invalid', invalidate);
    window.addEventListener('focus', refresh);
    window.addEventListener('dream-private-data-changed', dataChanged);
    void refresh();
    const timer = setInterval(refresh, 30000);
    return () => { active = false; clearInterval(timer); channel.current?.close(); privateChannel.current?.close();
      window.removeEventListener('dream-session-invalid', invalidate); window.removeEventListener('focus', refresh);
      window.removeEventListener('dream-private-data-changed', dataChanged); };
  }, []);
  useEffect(() => {
    if (!identity) return;
    const timer = setTimeout(() => { replace(null); window.location.replace('/login'); }, Math.max(0, Date.parse(identity.loginDeadline) - Date.now()));
    return () => clearTimeout(timer);
  }, [identity]);
  const login = async (username: string, password: string) => {
    if (transitioning.current) throw new Error('Authentication is already in progress.');
    transitioning.current = true;
    replace(null); setLoading(true);
    try {
      const response = await apiFetch('/api/auth/login/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (!response.ok) throw new Error(response.status === 429 ? 'Too many attempts. Please try again shortly.' : 'Unable to sign in. Check your username and password.');
      replace(await response.json()); channel.current?.postMessage('changed');
    } catch (error) { replace(null); throw error; }
    finally { transitioning.current = false; }
  };
  const logout = async () => {
    if (transitioning.current) throw new Error('Authentication is already in progress.');
    transitioning.current = true;
    version.current += 1;
    try {
      const response = await apiFetch('/api/auth/logout/', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out. Please try again.');
      channel.current?.postMessage('changed'); replace(null); window.location.replace('/login');
    } finally { transitioning.current = false; }
  };
  return <Auth.Provider value={{ user: identity?.user || null, loading, login, logout }}>
    <Provider key={identity ? `${identity.user.id}:${identity.loginDeadline}` : 'anonymous'} store={store}>{children}</Provider>
  </Auth.Provider>;
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth(); const router = useRouter(); const pathname = usePathname();
  useEffect(() => { if (!loading && !user) router.replace('/login?next=' + encodeURIComponent(pathname)); }, [loading, user, router, pathname]);
  if (loading || !user) return <div className="min-h-screen bg-pink-100 flex items-center justify-center" role="status">Opening your dream journal…</div>;
  return <>{children}</>;
}

export function PrivateServerContent({ ownerId, children }: { ownerId: string; children: React.ReactNode }) {
  const { user } = useAuth();
  useEffect(() => { if (user && user.id !== ownerId) window.location.replace('/journal'); }, [user, ownerId]);
  return user?.id === ownerId ? <>{children}</> : null;
}
