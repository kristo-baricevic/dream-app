import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { claimRows, evidenceSources, coverageLabel } from './workflowEvidence.ts';

test('sources retain exact public excerpts and strip legacy confidence', () => {
  const result = evidenceSources({ evidence: [{ kind: 'public_reference', evidence_id: 'ref-a', source: 'synthetic-paper', quote: 'Exact quotation.', page: 2, source_type: 'reference_unclassified', confidence: .85 }] }, []);
  assert.equal(result[0].content, 'Exact quotation.');
  assert.equal(result[0].page, 2);
  assert.equal('confidence' in result[0], false);
});

test('private citation identifies a source span without copied private text', () => {
  const result = evidenceSources({ evidence: [{ kind: 'user_entry', evidence_id: 'entry-a', entry_id: 'synthetic-entry', start_char: 0, end_char: 12 }] }, []);
  assert.equal(result[0].source, 'Saved dream record');
  assert.match(result[0].content, /0–12/);
  assert.equal(result[0].entryId, 'synthetic-entry');
});

test('real unsaved-draft evidence keeps its observation without a fabricated saved identity', () => {
  const draft = JSON.parse(readFileSync(new URL('./userDraftEvidence.fixture.json', import.meta.url), 'utf8'));
  assert.equal(draft.kind, 'user_draft');
  assert.equal(draft.entry_id, null);
  assert.equal('source' in draft, false);
  const output = {evidence: [draft], claims: [{kind: 'observation', text: 'A bridge appears in the draft.', evidence_ids: [draft.evidence_id]}]};
  const sources = evidenceSources(output, []);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].source, 'Current unsaved draft');
  assert.match(sources[0].content, /0–15/);
  assert.equal(sources[0].entryId, undefined);
  assert.notEqual(sources[0].content, draft.quote);
  const rows = claimRows(output);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].text, 'A bridge appears in the draft.');
  assert.equal(rows[0].citations, '[1]');
});

test('malformed private evidence cannot fall through and expose its copied quote', () => {
  for (const kind of ['user_draft', 'user_entry']) {
    const output = {evidence: [{kind, entry_id: 'fabricated-saved-id', start_char: -1, end_char: 15,
      source: 'synthetic-label', quote: 'PRIVATE SYNTHETIC QUOTE', evidence_id: 'private-test'}],
      claims: [{kind: 'observation', text: 'Malformed private source.', evidence_ids: ['private-test']}]};
    assert.deepEqual(evidenceSources(output, []), []);
    assert.deepEqual(claimRows(output), []);
  }
});

test('claim display maps citation numbers and rejects unknown sources', () => {
  const output = { evidence: [{ kind: 'public_reference', evidence_id: 'ref-a', source: 'synthetic', quote: 'Exact source.' }], claims: [{ kind: 'source_report', text: 'Source reports this.', evidence_ids: ['ref-a'] }, { kind: 'hypothesis', text: 'One possible meaning.', evidence_ids: [] }, { kind: 'observation', text: 'Unsupported.', evidence_ids: ['unknown'] }] };
  const rows = claimRows(output);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].citations, '[1]');
  assert.equal(rows[1].label, 'Possible interpretation');
});

test('coverage labels only measured subset counts', () => {
  assert.equal(coverageLabel({ coverage: { selected_entries: 24, included_entry_spans: 4 } }), '4 of 24 selected records supplied as evidence');
  assert.equal(coverageLabel({ coverage: { selected_entries: 2, included_entry_spans: 5 } }), null);
  assert.equal(coverageLabel(null), null);
});

test('legacy sources remain visible without scores and malformed metadata is ignored', () => {
  assert.equal(evidenceSources({}, [{ source: 'synthetic', content: 'Old quotation.', confidence: .9 }])[0].content, 'Old quotation.');
  assert.deepEqual(evidenceSources({ evidence: [null, {}, { kind: 'public_reference', source: {}, quote: false }] }, []), []);
});
