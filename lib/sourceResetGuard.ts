import { auditRequest, Revision } from './longitudinal';

export type SourceResetTicket = { expected_revision: Revision; expected_principal: string };

/** Capture the preview fence; auth integration sends both fields with the source write. */
export async function captureSourceReset(): Promise<SourceResetTicket | null> {
  const controller = new AbortController();
  try {
    const session = await auditRequest<{ user: { id: string } }>('/auth/session/', controller.signal);
    const preview = await auditRequest<{ warning: string; enabled: boolean; private_reviews_reset: number; merges_reset: number; linked_reflections: number; revision: Revision }>('/longitudinal/source-reset-preview/', controller.signal, 'GET', undefined, session.user.id);
    if ((preview.enabled || preview.private_reviews_reset || preview.merges_reset || preview.linked_reflections) && !window.confirm(preview.warning)) return null;
    if (!preview.revision || Object.keys(preview.revision).length !== 3 || !['source', 'privacy', 'review'].every(key => Number.isSafeInteger(preview.revision[key as keyof Revision]) && preview.revision[key as keyof Revision] >= 0)) throw new Error('Invalid source revision');
    const after = await auditRequest<{ user: { id: string } }>('/auth/session/', controller.signal);
    if (after.user.id !== session.user.id) throw new Error('Session changed');
    return { expected_revision: preview.revision, expected_principal: session.user.id };
  } catch {
    window.alert('Unable to verify the effect on your private profile. Reload and try again.');
    return null;
  }
}

/** Legacy callers warn before dispatch; parent replaces this with the captured ticket. */
export async function confirmSourceReset(): Promise<boolean> {
  return !!(await captureSourceReset());
}
