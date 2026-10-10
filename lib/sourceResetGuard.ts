import { auditRequest, Revision } from './longitudinal';
import { privateRequestGeneration } from '@/services/apiFetch';
import { JournalEntry } from '@/types';

export type SourceResetTicket = { expected_revision: Revision; expected_principal: string;
  expected_session: string; expected_source: JournalEntry['source_preimage'] | null;
  expected_operation: 'update' | 'delete' | 'preview' };

export const sourceMutationFields = (ticket: SourceResetTicket) => ({
  expected_revision: ticket.expected_revision, expected_session: ticket.expected_session,
  expected_source: ticket.expected_source, expected_operation: ticket.expected_operation,
});

/** Capture the preview fence; auth integration sends both fields with the source write. */
export async function captureSourceReset(preimage?: JournalEntry['source_preimage'], operation: 'update' | 'delete' | 'preview' = 'preview'): Promise<SourceResetTicket | null> {
  const controller = new AbortController();
  try {
    const generation = privateRequestGeneration();
    if (operation !== 'preview' && (!preimage || !/^[a-f0-9]{64}$/.test(preimage.content_hash))) throw new Error('Reload the displayed source');
    const session = await auditRequest<{ user: { id: string }; loginDeadline: string }>('/auth/session/', controller.signal);
    if (!session.user?.id || typeof session.loginDeadline !== 'string' || !Number.isFinite(Date.parse(session.loginDeadline))) throw new Error('Invalid session');
    const preview = await auditRequest<{ warning: string; enabled: boolean; private_reviews_reset: number; merges_reset: number; linked_reflections: number; revision: Revision }>('/longitudinal/source-reset-preview/', controller.signal, 'GET', undefined, session.user.id);
    if ((preview.enabled || preview.private_reviews_reset || preview.merges_reset || preview.linked_reflections) && !window.confirm(preview.warning)) return null;
    if (!preview.revision || Object.keys(preview.revision).length !== 3 || !['source', 'privacy', 'review'].every(key => Number.isSafeInteger(preview.revision[key as keyof Revision]) && preview.revision[key as keyof Revision] >= 0)) throw new Error('Invalid source revision');
    const after = await auditRequest<{ user: { id: string }; loginDeadline: string }>('/auth/session/', controller.signal);
    if (after.user.id !== session.user.id || after.loginDeadline !== session.loginDeadline || generation !== privateRequestGeneration()) throw new Error('Session changed');
    return { expected_revision: preview.revision, expected_principal: session.user.id,
      expected_session: session.loginDeadline, expected_source: preimage ? { ...preimage } : null, expected_operation: operation };
  } catch {
    window.alert('Unable to verify the effect on your private profile. Reload and try again.');
    return null;
  }
}

/** Legacy callers warn before dispatch; parent replaces this with the captured ticket. */
export async function confirmSourceReset(): Promise<boolean> {
  return !!(await captureSourceReset());
}
