import { apiFetch } from '@/services/apiFetch';
export type Revision = { source: number; privacy: number; review: number };
export function sameRevision(left: Revision | null | undefined, right: Revision | null | undefined): boolean {
  return !!left && !!right && ['source', 'privacy', 'review'].every(key => left[key as keyof Revision] === right[key as keyof Revision]);
}
export type Source = { id: string; recorded_at: string; included: boolean; origin: string; language: string; independent_occurrence: boolean };
export type Reflection = { id: string; text: string; revision: number; entry_id: string | null; use_for_profile: boolean; use_for_chat: boolean; created_at: string };
export type Evidence = { entry_id: string; recorded_at: string; start: number; end: number; excerpt: string };
export type Theme = { id: string; label: string; key: string; kind: string; support: number; denominator: number | null; rate: number | null; partial_support: number; review: string; provenance: string; temporal_label: string; evidence: Evidence[]; qualified_evidence?: (Evidence & { polarity: string; experiencer: string; origin: string })[]; windows: Record<string, { support: number; audited: number; eligible: number }> };
export type Profile = { status: string; revision: Revision; as_of?: string; aggregator_version?: string; coverage?: { eligible_unique: number; audited_unique: number; excluded: number; duplicate_entries: number; unsupported: number; pending: number }; themes: Theme[]; rejected_decisions_next_offset?: number | null; rejected_decisions?: { id: string; label: string; key: string }[]; merges?: { id: string; label: string; theme_ids: string[] }[] };
export type Preferences = { enabled: boolean; revision: Revision; suppressed_public_keys: string[] };
export type Observation = { id: string; key: string; kind: string; start: number; end: number; quote: string; polarity: string; experiencer: string; origin: string };
export type EntryAudit = { entry_id: string; content?: string | null; status: string; observations: Observation[]; revision: Revision; provenance: null | { extractor: string; codebook: string; schema: string; model: string } };
export type Preview = { new_count: number; cached_count: number; max_input_tokens: number; revision: Revision; sources: { entry_id: string; skip: string | null; cached: boolean }[] };

export class AuditError extends Error {
  constructor(public status: number) {
    super(status === 401 || status === 403 ? 'Sign in to view your private profile.' : status === 409 ? 'Your records changed. Reload and review the current version.' : status === 503 ? 'Private auditing is temporarily unavailable.' : 'This request could not be completed. Check your selection and retry.');
  }
}

/** Existing analyzer session/CSRF contract. No owner IDs or credentials in bodies/storage. */
export async function auditRequest<T>(path: string, signal: AbortSignal, method = 'GET', data?: unknown, expectedPrincipal?: string): Promise<T> {
  if (!path.startsWith('/') || path.startsWith('//')) throw new AuditError(503);
  if (signal.aborted) throw new DOMException('Session changed', 'AbortError');
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (expectedPrincipal) headers['X-Dream-Principal'] = expectedPrincipal;
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  const response = await apiFetch(`/api${path}`, { method, signal, headers, body: data === undefined ? undefined : JSON.stringify(data) });
  if (signal.aborted) throw new DOMException('Session changed', 'AbortError');
  if (!response.ok) throw new AuditError(response.status);
  if (!path.startsWith('/auth/') && (!expectedPrincipal || response.headers.get('X-Dream-Principal') !== expectedPrincipal)) throw new AuditError(401);
  const result = response.status === 204 ? undefined as T : await response.json();
  if (signal.aborted) throw new DOMException('Session changed', 'AbortError');
  return result;
}

export function codepointSpan(text: string, startUTF16: number, endUTF16: number) {
  if (![startUTF16, endUTF16].every(Number.isInteger) || startUTF16 < 0 || endUTF16 <= startUTF16 || endUTF16 > text.length) throw new Error('Select a nonempty passage.');
  const start = Array.from(text.slice(0, startUTF16)).length;
  const end = Array.from(text.slice(0, endUTF16)).length;
  const quote = text.slice(startUTF16, endUTF16);
  if (Array.from(text).slice(start, end).join('') !== quote) throw new Error('Select complete characters.');
  return { start, end, quote };
}

export function temporalText(value: string) {
  return ({ more_in_recent_records: 'More in recent records', less_in_recent_records: 'Less in recent records', no_clear_change_in_records: 'No clear change in records', limited_evidence: 'Too little comparable evidence for a change label' } as Record<string, string>)[value] ?? 'Change comparison unavailable';
}
