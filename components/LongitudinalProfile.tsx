'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AuditError, auditRequest, codepointSpan, EntryAudit, Preferences, Preview, Profile, Reflection, sameRevision, Source, temporalText, Theme } from '@/lib/longitudinal';

const button = 'rounded-lg border border-pink-200 bg-white px-3 py-2 text-sm hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed';
const card = 'rounded-2xl border border-pink-100 bg-white p-5 shadow-sm';
const date = (value: string) => new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
type Request = typeof auditRequest;

function ThemeCard({ theme, busy, review, select, selected }: { theme: Theme; busy: boolean; review: (id: string, status: string, label?: string) => void; select: () => void; selected: boolean }) {
  const [label, setLabel] = useState(theme.label);
  useEffect(() => setLabel(theme.label), [theme.label]);
  return <article className={card}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-pink-700">{theme.provenance === 'user_interpretation' ? 'Your interpretation' : 'Literal content pattern'}</p><h3 className="mt-1 text-xl font-semibold">{theme.label}</h3></div><label className="text-sm"><input type="checkbox" checked={selected} disabled={busy} onChange={select} aria-label={`Group ${theme.label}`} /> Group</label></div>
    <p className="mt-3">Appears in <strong>{theme.support}</strong> distinct included records{theme.denominator !== null && theme.rate !== null ? ` out of ${theme.denominator} completely audited records` : '. A comparable frequency is unavailable'}.</p>
    {theme.partial_support > 0 && <p className="text-sm text-amber-800">{theme.partial_support} supporting records have partial or user-authored evidence.</p>}
    <p className="mt-2 text-sm text-slate-600">{temporalText(theme.temporal_label)}</p>
    <details className="mt-3"><summary className="cursor-pointer text-sm underline">Inspect source evidence ({theme.evidence.length})</summary><ul className="mt-2 space-y-2">{theme.evidence.map(e => <li key={`${e.entry_id}:${e.start}`} className="rounded-lg bg-pink-50 p-3 text-sm"><Link className="underline" href={`/journal/${e.entry_id}`}>{date(e.recorded_at)}</Link><p className="mt-1 whitespace-pre-wrap">“{e.excerpt}”</p><p className="text-xs text-slate-500">Recorded date · source characters {e.start}–{e.end}</p></li>)}</ul>{theme.rate !== null && <p className="mt-2 text-xs text-slate-600">Recent / previous 30 recorded days: {theme.windows.recent.support}/{theme.windows.recent.audited} / {theme.windows.previous.support}/{theme.windows.previous.audited} completely audited records. Change labels use descriptive display thresholds, not psychological certainty.</p>}</details>
    {theme.qualified_evidence && theme.qualified_evidence.length > 0 && <details className="mt-3"><summary className="cursor-pointer text-sm underline">Qualified or differently attributed mentions ({theme.qualified_evidence.length})</summary><p className="mt-2 text-xs text-slate-600">These mentions do not count toward the pattern. Negated, uncertain and other-person emotions qualify the evidence; they are not psychological contradictions.</p><ul>{theme.qualified_evidence.map(e => <li key={`${e.entry_id}:${e.start}`} className="mt-2 text-sm"><Link className="underline" href={`/journal/${e.entry_id}`}>{date(e.recorded_at)}</Link> · “{e.excerpt}” · {e.polarity} · {e.experiencer} · {e.origin === 'user_authored' ? 'Your annotation' : 'Literal candidate'}</li>)}</ul></details>}
    <form className="mt-4" onSubmit={e => { e.preventDefault(); review(theme.id, 'confirmed', label === theme.label ? undefined : label); }}><label className="block text-sm">Your label<input className="mt-1 w-full rounded-lg border p-2" maxLength={200} value={label} onChange={e => setLabel(e.target.value)} disabled={busy} /></label><div className="mt-2 flex flex-wrap gap-2"><button className={button} disabled={busy}>Confirm interpretation</button><button type="button" className={button} disabled={busy} onClick={() => review(theme.id, 'rejected')}>Reject theme</button>{theme.review === 'confirmed' && <button type="button" className={button} disabled={busy} onClick={() => review(theme.id, 'unreviewed')}>Undo confirmation</button>}</div><p className="mt-2 text-xs text-slate-500">{theme.review === 'confirmed' ? 'Confirmed by you.' : 'Awaiting your review.'} Your label is an interpretation; it does not change the quoted dream content.</p></form>
  </article>;
}

export default function LongitudinalProfile({ request = auditRequest }: { request?: Request }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [groupLabel, setGroupLabel] = useState('');
  const [window, setWindow] = useState('all');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [run, setRun] = useState<{ id: string; status: string } | null>(null);
  const [audit, setAudit] = useState<EntryAudit | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [useReflection, setUseReflection] = useState(false);
  const [editingReflection, setEditingReflection] = useState<Reflection | null>(null);
  const [warning, setWarning] = useState<{ text: string; source: Source } | null>(null);
  const [selection, setSelection] = useState<{ start: number; end: number; quote: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const principal = useRef<string | null>(null);
  const nextOffset = useRef<number | null>(null);
  const nextReflectionOffset = useRef<number | null>(null);
  const reflectionRevision = useRef<Profile['revision'] | null>(null);
  const [decisions, setDecisions] = useState<{ id: string; label: string; key: string }[]>([]);
  const nextDecisionOffset = useRef<number | null>(null);
  const privateRequest: Request = useCallback((path, signal, method, data) => request(path, signal, method, data, principal.current ?? undefined), [request]);

  const clear = useCallback(() => { setProfile(null); setPrefs(null); setSources([]); setReflections([]); setSelected([]); setGroups([]); setPreview(null); setRun(null); setAudit(null); setWarning(null); setReflectionText(''); setEditingReflection(null); setUseReflection(false); setSelection(null); setGroupLabel(''); setNotice(''); nextOffset.current = null; nextReflectionOffset.current = null; reflectionRevision.current = null; nextDecisionOffset.current = null; setDecisions([]); }, []);
  const load = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController(); controller.current = active;
    const current = ++generation.current;
    clear(); setBusy(true); setError('');
    try {
      const session = await request<{ user: { id: string } }>('/auth/session/', active.signal);
      if (!session.user?.id) throw new AuditError(401);
      principal.current = session.user.id;
      const [p, settings, records, thoughts] = await Promise.all([
        privateRequest<Profile>(`/longitudinal/profile/?window=${window}`, active.signal),
        privateRequest<Preferences>('/longitudinal/preferences/', active.signal),
        privateRequest<{ sources: Source[]; next_offset: number | null; revision: Profile['revision'] }>('/longitudinal/sources/', active.signal),
        privateRequest<{ reflections: Reflection[]; next_offset: number | null; revision: Profile['revision'] }>('/longitudinal/reflections/', active.signal),
      ]);
      if (generation.current !== current || active.signal.aborted) return;
      if (![p.revision, records.revision, thoughts.revision].every(value => sameRevision(value, settings.revision))) throw new AuditError(409);
      const after = await request<{ user: { id: string } }>('/auth/session/', active.signal);
      if (after.user.id !== principal.current || generation.current !== current || active.signal.aborted) throw new AuditError(401);
      setProfile(p); setPrefs(settings); setSources(records.sources); nextOffset.current = records.next_offset; setReflections(thoughts.reflections); nextReflectionOffset.current = thoughts.next_offset; reflectionRevision.current = thoughts.revision; setDecisions(p.rejected_decisions ?? []); nextDecisionOffset.current = p.rejected_decisions_next_offset ?? null;
    } catch (e) { if (!active.signal.aborted && generation.current === current) { clear(); setError(e instanceof Error ? e.message : 'Unable to load your profile.'); } }
    finally { if (!active.signal.aborted && generation.current === current) setBusy(false); }
  }, [clear, request, privateRequest, window]);
  useEffect(() => { void load(); return () => { controller.current?.abort(); }; }, [load]);
  useEffect(() => {
    const check = async () => {
      if (document.visibilityState !== 'visible' || !controller.current) return;
      try { const session = await request<{ user: { id: string } }>('/auth/session/', controller.current.signal); if (session.user.id !== principal.current) { clear(); void load(); } }
      catch { clear(); controller.current?.abort(); generation.current++; setBusy(false); setError('Sign in to view your private profile.'); }
    };
    const changed = () => { controller.current?.abort(); generation.current++; clear(); void load(); };
    document.addEventListener('visibilitychange', check);
    globalThis.addEventListener('dream-session-invalid', changed);
    const channel = new BroadcastChannel('dream-auth'); channel.onmessage = changed;
    globalThis.addEventListener('focus', check);
    const interval = setInterval(check, 30000);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', check); globalThis.removeEventListener('dream-session-invalid', changed); channel.close(); globalThis.removeEventListener('focus', check); };
  }, [clear, load, request]);

  const action = async (work: (signal: AbortSignal) => Promise<void>, reload = true) => {
    if (busy || !controller.current) return;
    const active = controller.current; const current = generation.current;
    setBusy(true); setError('');
    try {
      const session = await request<{ user: { id: string } }>('/auth/session/', active.signal);
      if (session.user.id !== principal.current) { clear(); throw new AuditError(401); }
      await work(active.signal);
      if (!active.signal.aborted && current === generation.current && reload) await load();
    } catch (e) { if (!active.signal.aborted && current === generation.current) { clear(); setError(e instanceof Error ? e.message : 'Unable to complete this request.'); } }
    finally { if (!active.signal.aborted && current === generation.current) setBusy(false); }
  };
  const rev = profile?.revision ?? prefs?.revision;
  const review = (id: string, status: string, label?: string) => void action(async signal => { await privateRequest(`/longitudinal/themes/${id}/`, signal, 'PATCH', { status, ...(label === undefined ? {} : { label }), expected_revision: rev }); });
  const changeSource = (source: Source) => void action(async signal => { const result = await privateRequest<{ warning: string }>('/longitudinal/source-reset-preview/', signal); setWarning({ text: result.warning, source }); }, false);
  const saveReflection = (e: FormEvent) => { e.preventDefault(); void action(async signal => { await privateRequest(editingReflection ? `/longitudinal/reflections/${editingReflection.id}/` : '/longitudinal/reflections/', signal, editingReflection ? 'PATCH' : 'POST', { text: reflectionText, use_for_profile: useReflection, ...(editingReflection ? { expected_revision: editingReflection.revision } : {}) }); }); };

  return <div className="mx-auto max-w-5xl space-y-5 py-6 text-slate-800">
    <header><p className="text-sm font-medium text-pink-700">Your journal, over time</p><h1 className="mt-1 text-3xl font-semibold">Dream profile</h1><p className="mt-3 max-w-3xl text-slate-600">Explore recurring literal topics and reported emotions, with evidence you can inspect. Add your own reflections and correct what does not fit. Dreams are recorded experiences, not evidence that events happened. This profile offers no diagnoses or hidden motives.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-white p-4">{error} <button className={`${button} ml-3`} disabled={busy} onClick={() => void load()}>Reload</button></div>}
    {notice && <p role="status" className="rounded-xl bg-white p-4">{notice}</p>}
    {busy && <p role="status" aria-live="polite">Loading your private records…</p>}
    {prefs && <section className={card}><h2 className="text-lg font-semibold">Private audit controls</h2><p className="mt-2 text-sm text-slate-600">Local English literal matching. Only records you identify as your own and include are audited. Each distinct record counts once, regardless of length. Exact repeated content counts once unless you mark an independent occurrence.</p><label className="mt-4 flex items-center gap-2"><input type="checkbox" checked={prefs.enabled} disabled={busy} onChange={e => void action(async signal => { await privateRequest('/longitudinal/preferences/', signal, 'PATCH', { enabled: e.target.checked, expected_revision: rev }); })} /> Enable private dream auditing</label><p className="mt-2 text-xs text-slate-600">Turning this off removes derived audits, private theme reviews, groups and profile snapshots. Raw dreams, legacy analyses and independently authored reflections remain. Profile sharing with analysis and chat is unavailable until its privacy integration is verified.</p></section>}
    {profile && <section aria-labelledby="profile-heading" className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="profile-heading" className="text-xl font-semibold">Recurring patterns</h2><label className="text-sm">Recorded window <select className="ml-2 rounded-lg border bg-white p-2" value={window} disabled={busy} onChange={e => setWindow(e.target.value)}><option value="all">All records</option><option value="30d">Last 30 days</option><option value="90d">Last 90 days</option></select></label></div>
      {profile.coverage && <div className="rounded-xl bg-white p-4 text-sm"><strong>{profile.coverage.audited_unique} of {profile.coverage.eligible_unique}</strong> eligible distinct records completely audited · {profile.coverage.excluded} excluded · {profile.coverage.duplicate_entries} duplicates · {profile.coverage.unsupported} unsupported language. <p className="mt-1 text-slate-600">Dates refer to when records were created. Missing or unsupported audits do not count as evidence that a theme is absent.</p></div>}
      {profile.status === 'disabled' && <p className={card}>Enable auditing, then choose the dreams you want included.</p>}
      {profile.status === 'empty' && <p className={card}>No included records yet. Choose personal dream records below; generated and imported records start excluded.</p>}
      {profile.status === 'stale' && <p className={card}>A source changed. Its derived evidence and private theme reviews were removed. Review inclusion and audit the current sources.</p>}
      {profile.status === 'partial' && <p className="rounded-xl bg-amber-50 p-4 text-sm">Some included records are awaiting audit or have partial evidence. Pattern frequencies may be unavailable.</p>}
      {!['disabled', 'empty', 'stale'].includes(profile.status) && profile.themes.length === 0 && <p className={card}>No recurring literal patterns in the available evidence. A pattern needs support from at least two distinct records; sparse data may produce none.</p>}
      <div className="grid gap-4 md:grid-cols-2">{profile.themes.map(theme => <ThemeCard key={theme.id} theme={theme} busy={busy} review={review} selected={groups.includes(theme.id)} select={() => setGroups(g => g.includes(theme.id) ? g.filter(id => id !== theme.id) : [...g, theme.id].slice(0, 8))} />)}</div>
      {groups.length >= 2 && <form className={`${card} flex flex-wrap gap-2`} onSubmit={e => { e.preventDefault(); void action(async signal => { await privateRequest('/longitudinal/merges/', signal, 'POST', { theme_ids: groups, label: groupLabel, expected_revision: rev }); }); }}><label>Your group label <input maxLength={200} className="rounded-lg border p-2" required value={groupLabel} onChange={e => setGroupLabel(e.target.value)} /></label><button className={button} disabled={busy}>Group selected themes</button><p className="w-full text-xs">Groups express your interpretation. Their source frequencies stay separate.</p></form>}
      {profile.merges?.map(group => <div key={group.id} className={card}><strong>Your group: {group.label}</strong><p className="text-sm">{group.theme_ids.map(id => profile.themes.find(t => t.id === id)?.label ?? 'Theme outside this window').join(' · ')}</p><button className={`${button} mt-2`} disabled={busy} onClick={() => void action(async signal => { await privateRequest(`/longitudinal/merges/${group.id}/`, signal, 'DELETE', { expected_revision: rev }); })}>Remove group</button></div>)}
      {profile.as_of && <p className="text-xs text-slate-500">Updated {date(profile.as_of)} · evidence version {profile.aggregator_version} · source/privacy/review {profile.revision.source}/{profile.revision.privacy}/{profile.revision.review}</p>}
    </section>}
    {prefs && <section className={card}><h2 className="text-xl font-semibold">Source records</h2><p className="mt-2 text-sm text-slate-600">Including a record confirms that it is your own reported dream and that local English matching is appropriate. Exclude sensitive records at any time. Source preference changes remove linked reflections and reset all private theme reviews and groups.</p><ul className="mt-4 divide-y">{sources.map(source => <li key={source.id} className="flex flex-wrap items-center gap-3 py-3"><input aria-label={`Select ${date(source.recorded_at)}`} type="checkbox" disabled={busy || !prefs.enabled || !source.included} checked={selected.includes(source.id)} onChange={() => { setPreview(null); setSelected(ids => ids.includes(source.id) ? ids.filter(id => id !== source.id) : [...ids, source.id].slice(0, 10)); }} /><Link className="underline" href={`/journal/${source.id}`}>{date(source.recorded_at)}</Link><span className="text-xs text-slate-600">{source.included ? 'Included' : 'Excluded'} · {source.origin} · {source.language}{source.independent_occurrence ? ' · independent occurrence' : ''}</span><button className={button} disabled={busy || !prefs.enabled} onClick={() => changeSource(source)}>{source.included ? 'Exclude' : 'Include my English dream'}</button>{source.included && <button className={button} disabled={busy} onClick={() => void action(async signal => { setAudit(await privateRequest<EntryAudit>(`/entries/${source.id}/audit/`, signal)); setSelection(null); }, false)}>Inspect audit</button>}</li>)}</ul>
      {nextOffset.current !== null && <button className={button} disabled={busy} onClick={() => void action(async signal => { const result = await privateRequest<{ sources: Source[]; next_offset: number | null; revision: Profile['revision'] }>(`/longitudinal/sources/?offset=${nextOffset.current}`, signal); if (JSON.stringify(result.revision) !== JSON.stringify(rev)) { await load(); return; } setSources(s => [...new Map([...s, ...result.sources].map(source => [source.id, source])).values()]); nextOffset.current = result.next_offset; }, false)}>Load older records</button>}
      <div className="mt-4 flex gap-2"><button className={button} disabled={busy || selected.length === 0} onClick={() => void action(async signal => { setPreview(await privateRequest<Preview>('/longitudinal/audits/preview/', signal, 'POST', { entry_ids: selected, mode: 'local' })); }, false)}>Preview audit ({selected.length}/10)</button>{preview && <button className={button} disabled={busy || preview.new_count === 0} onClick={() => void action(async signal => { const result = await privateRequest<{ id: string; status: string }>('/longitudinal/audits/', signal, 'POST', { entry_ids: selected, mode: 'local', idempotency_key: crypto.randomUUID(), expected_revision: preview.revision }); setRun(result); setPreview(null); }, false)}>Audit selected records</button>}</div>
      {preview && <div className="mt-3 text-sm"><p>{preview.new_count} new local audits · {preview.cached_count} cached · no provider tokens.</p>{preview.sources.filter(s => s.skip).map(s => <p key={s.entry_id}>Record {date(sources.find(source => source.id === s.entry_id)?.recorded_at ?? '')}: {s.skip?.replaceAll('_', ' ')}</p>)}</div>}
      {run && <div className="mt-3 text-sm" role="status">Audit {run.status}. <button className={button} disabled={busy} onClick={() => void action(async signal => { const value = await privateRequest<{ id: string; status: string }>(`/longitudinal/audits/${run.id}/`, signal); setRun(value); if (['complete', 'partial', 'cancelled', 'stale', 'failed'].includes(value.status)) { setNotice(`Audit ${value.status}.`); await load(); } }, false)}>Check progress</button>{run.status === 'queued' && <button className={`${button} ml-2`} disabled={busy} onClick={() => void action(async signal => { await privateRequest(`/longitudinal/audits/${run.id}/`, signal, 'DELETE', { expected_revision: rev }); })}>Cancel queued audit</button>}</div>}
    </section>}
    {audit && <section className={card}><div className="flex justify-between"><h2 className="text-xl font-semibold">Individual dream audit</h2><button className={button} onClick={() => setAudit(null)}>Close</button></div><p className="mt-2 text-sm">{audit.status} · {audit.provenance?.extractor ?? 'No extraction yet'}. Literal candidates and your annotations remain distinct.</p><ul className="mt-3 space-y-2">{audit.observations.map(o => <li key={o.id} className="rounded-lg bg-pink-50 p-3 text-sm"><p>“{o.quote}” · {o.key} · {o.polarity} · {o.experiencer} · {o.origin === 'user_authored' ? 'Your annotation' : 'Literal candidate'}</p><button className={`${button} mt-2`} disabled={busy} onClick={() => void action(async signal => { await privateRequest(`/entries/${audit.entry_id}/observations/${o.id}/`, signal, 'DELETE', { expected_revision: audit.revision }); })}>Remove annotation</button></li>)}</ul>
      {typeof audit.content === "string" && <><label className="mt-4 block text-sm">Select a passage to add your own entity annotation<textarea readOnly rows={6} className="mt-2 w-full rounded-lg border p-3" value={audit.content} onSelect={e => { try { setSelection(codepointSpan(e.currentTarget.value, e.currentTarget.selectionStart, e.currentTarget.selectionEnd)); } catch { setSelection(null); } }} /></label>{selection && <button className={`${button} mt-2`} disabled={busy || Array.from(selection.quote).length > 200} onClick={() => void action(async signal => { await privateRequest(`/entries/${audit.entry_id}/observations/`, signal, 'POST', { expected_revision: audit.revision, observation: { ...selection, kind: 'entity', key: 'entity:auto', polarity: 'affirmed', experiencer: 'unknown' } }); })}>Add “{selection.quote.slice(0, 60)}” as my annotation</button>}</>}
    </section>}
    {prefs && <section className={card}><h2 className="text-xl font-semibold">Your own reflections</h2><p className="mt-2 text-sm text-slate-600">What concerns or meanings do you connect with your dreams? These are your statements, displayed separately from literal patterns. Global reflections survive source edits. Chat sharing remains disabled.</p><form onSubmit={saveReflection} className="mt-4"><label className="block text-sm">{editingReflection ? 'Edit reflection' : 'New reflection'}<textarea required maxLength={4000} rows={3} className="mt-2 w-full rounded-lg border p-3" value={reflectionText} onChange={e => setReflectionText(e.target.value)} disabled={busy} /></label><label className="mt-2 flex gap-2 text-sm"><input type="checkbox" checked={useReflection} onChange={e => setUseReflection(e.target.checked)} disabled={busy} /> Include this reflection in my profile</label><button className={`${button} mt-3`} disabled={busy || !reflectionText.trim()}>Save reflection</button></form><ul className="mt-5 space-y-3">{reflections.map(r => <li key={r.id} className="rounded-xl bg-pink-50 p-4"><p className="whitespace-pre-wrap">{r.text}</p><p className="mt-2 text-xs">Your reflection · {date(r.created_at)} · {r.use_for_profile ? 'Included in profile' : 'Private note'}</p><div className="mt-2 flex gap-2"><button className={button} disabled={busy} onClick={() => { setEditingReflection(r); setReflectionText(r.text); setUseReflection(r.use_for_profile); }}>Edit</button><button className={button} disabled={busy} onClick={() => void action(async signal => { await privateRequest(`/longitudinal/reflections/${r.id}/`, signal, 'DELETE', { expected_revision: r.revision }); })}>Delete reflection</button></div></li>)}</ul></section>}
    {prefs && prefs.suppressed_public_keys.length > 0 && <section className={card}><h2 className="text-lg font-semibold">Rejected literal themes</h2><p className="mt-2 text-sm">These public categories remain rejected after source resets. You can reconsider them.</p><ul className="mt-3 space-y-2">{prefs.suppressed_public_keys.map(key => <li key={key}>{key.replace(':', ': ')} <button className={`${button} ml-2`} disabled={busy} onClick={() => void action(async signal => { await privateRequest('/longitudinal/rejections/undo/', signal, 'POST', { key, expected_revision: rev }); })}>Undo rejection</button></li>)}</ul></section>}
    {decisions.map(decision => <div key={decision.id} className={card}><p>Rejected interpretation: {decision.label}</p><button className={`${button} mt-2`} disabled={busy} onClick={() => review(decision.id, 'unreviewed')}>Undo rejection</button></div>)}
    {profile && nextDecisionOffset.current !== null && <button className={button} disabled={busy} onClick={() => void action(async signal => { const result = await privateRequest<{ decisions: { id: string; label: string; key: string }[]; next_offset: number | null; revision: Profile['revision'] }>(`/longitudinal/decisions/?offset=${nextDecisionOffset.current}`, signal); if (JSON.stringify(result.revision) !== JSON.stringify(rev)) { await load(); return; } setDecisions(rows => [...new Map([...rows, ...result.decisions].map(r => [r.id, r])).values()]); nextDecisionOffset.current = result.next_offset; }, false)}>Load older rejected decisions</button>}
    {prefs && nextReflectionOffset.current !== null && <button className={button} disabled={busy} onClick={() => void action(async signal => { const result = await privateRequest<{ reflections: Reflection[]; next_offset: number | null; revision: Profile['revision'] }>(`/longitudinal/reflections/?offset=${nextReflectionOffset.current}`, signal); if (JSON.stringify(result.revision) !== JSON.stringify(reflectionRevision.current)) { await load(); return; } setReflections(rows => [...new Map([...rows, ...result.reflections].map(r => [r.id, r])).values()]); nextReflectionOffset.current = result.next_offset; }, false)}>Load older reflections</button>}
    {warning && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="reset-title"><div className={`${card} max-w-lg`}><h2 id="reset-title" className="text-xl font-semibold">Review source change</h2><p className="mt-3">{warning.text}</p>{!warning.source.included && <p className="mt-2 text-sm">By including this record, you confirm it is your own dream and choose local English matching.</p>}<div className="mt-5 flex gap-2"><button className={button} disabled={busy} onClick={() => { const source = warning.source; void action(async signal => { await privateRequest(`/entries/${source.id}/audit-preferences/`, signal, 'PATCH', { included: !source.included, ...(source.included ? {} : { origin: 'user_reported', language: 'en' }), expected_revision: rev }); }); }}>Confirm source change</button><button className={button} disabled={busy} onClick={() => setWarning(null)}>Keep current source</button></div></div></div>}
  </div>;
}
