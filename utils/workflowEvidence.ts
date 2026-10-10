type Source = { source: string; content: string; sourceType?: string; page?: number; evidenceId?: string; entryId?: string };
type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as RecordValue : {};

// Historical scores are retained in storage, but no calibration supports their display.
export function evidenceSources(output: unknown, legacy: unknown): Source[] {
  const data = record(output);
  const items = Array.isArray(data.evidence) ? data.evidence : Array.isArray(data.references) ? data.references : Array.isArray(legacy) ? legacy : [];
  return items.slice(0, 40).flatMap((item): Source[] => {
    const value = record(item);
    const saved = value.kind === 'user_entry' && typeof value.entry_id === 'string';
    const draft = value.kind === 'user_draft' && value.entry_id === null;
    if ((saved || draft) && typeof value.start_char === 'number' && typeof value.end_char === 'number'
      && Number.isInteger(value.start_char) && Number.isInteger(value.end_char) && value.start_char >= 0 && value.end_char > value.start_char) {
      return [{ source: draft ? 'Current unsaved draft' : 'Saved dream record', content: `Source span ${value.start_char}–${value.end_char} (Unicode characters)`, evidenceId: typeof value.evidence_id === 'string' ? value.evidence_id : undefined, ...(saved ? {entryId: value.entry_id as string} : {}) }];
    }
    // Private kinds never become public/legacy quotations when malformed.
    if (value.kind === 'user_entry' || value.kind === 'user_draft') return [];
    const content = value.quote ?? value.content;
    if (typeof value.source !== 'string' || typeof content !== 'string') return [];
    return [{ source: value.source, content, sourceType: typeof value.source_type === 'string' ? value.source_type : undefined,
      page: typeof value.page === 'number' ? value.page : undefined, evidenceId: typeof value.evidence_id === 'string' ? value.evidence_id : undefined }];
  });
}

export function coverageLabel(output: unknown): string | null {
  const coverage = record(record(output).coverage);
  const selected = coverage.selected_entries;
  const included = coverage.included_entry_spans;
  if (typeof selected !== 'number' || typeof included !== 'number' || !Number.isInteger(selected) || !Number.isInteger(included) || selected < 1 || included < 0 || included > selected) return null;
  return `${included} of ${selected} selected records supplied as evidence`;
}

export function claimRows(output: unknown): Array<{ label: string; text: string; citations: string }> {
  const data = record(output);
  if (!Array.isArray(data.claims)) return [];
  const sources = evidenceSources(output, []);
  const labels: Record<string, string> = { observation: 'Record observation', source_report: 'Reference report', hypothesis: 'Possible interpretation', reflective_prompt: 'Reflection question', style_suggestion: 'Style suggestion' };
  return data.claims.slice(0, 20).flatMap((item) => {
    const claim = record(item);
    if (typeof claim.kind !== 'string' || !labels[claim.kind] || typeof claim.text !== 'string' || !Array.isArray(claim.evidence_ids)) return [];
    const indices = claim.evidence_ids.map(id => sources.findIndex(source => source.evidenceId === id));
    if (indices.some(index => index < 0)) return [];
    return [{ label: labels[claim.kind], text: claim.text, citations: indices.map(index => `[${index + 1}]`).join(' ') }];
  });
}
