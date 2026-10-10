import { auditRequest } from './longitudinal';

/** Show the approved warning; parent integrates atomic source invalidation. */
export async function confirmSourceReset(): Promise<boolean> {
  const controller = new AbortController();
  try {
    const session = await auditRequest<{ user: { id: string } }>('/auth/session/', controller.signal);
    const preview = await auditRequest<{ warning: string; enabled: boolean; private_reviews_reset: number; merges_reset: number; linked_reflections: number }>('/longitudinal/source-reset-preview/', controller.signal, 'GET', undefined, session.user.id);
    if (!preview.enabled && !preview.private_reviews_reset && !preview.merges_reset && !preview.linked_reflections) return true;
    return window.confirm(preview.warning);
  } catch {
    window.alert('Unable to verify the effect on your private profile. Reload and try again.');
    return false;
  }
}
