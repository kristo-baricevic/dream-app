'use client';
import { useState } from 'react';
import { IconCloudFilled } from '@tabler/icons-react';
import { useAuth } from '@/components/AuthProvider';
import { safeNextPath } from '@/utils/authRouting';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState(''); const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return; setBusy(true); setError('');
    try {
      await login(username, password); setPassword('');
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.replace(safeNextPath(next, window.location.origin));
    } catch (error) { setPassword(''); setError(error instanceof Error ? error.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  };
  return <main className="background-main min-h-screen bg-pink-100 flex items-center justify-center p-6">
    <section className="w-full max-w-md bg-white/90 rounded-3xl border border-pink-200 shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 px-8 py-7 flex items-center gap-3">
        <IconCloudFilled className="text-white w-9 h-9" /><span className="font-mono text-xl">Dream Analyzer</span>
      </div>
      <form onSubmit={submit} className="p-8 space-y-5">
        <div><h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1><p className="text-slate-500 mt-2">Sign in to your dream journal.</p></div>
        <label className="block text-sm text-slate-700">Username<input autoComplete="username" required maxLength={150} value={username} onChange={(event) => setUsername(event.target.value)} disabled={busy} className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400" /></label>
        <label className="block text-sm text-slate-700">Password<input type="password" autoComplete="current-password" required maxLength={1024} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} className="mt-2 w-full rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-pink-400 hover:bg-pink-500 py-3 font-medium text-slate-900 disabled:opacity-60">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </section>
  </main>;
}
