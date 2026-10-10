// Existing TypeScript compiler + Node built-ins; no added test dependency.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const resolved = path.resolve(file);
  const source = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const loaded = new Module(resolved, module);
  loaded.filename = resolved; loaded.paths = Module._nodeModulePaths(path.dirname(resolved));
  const original = loaded.require.bind(loaded);
  loaded.require = id => dependencies[id] || original(id);
  loaded._compile(source, resolved);
  return loaded.exports;
}
let response, recorded;
const apiFetch = async (input, init) => { recorded = { input, init }; return response; };
const { codepointSpan, auditRequest, AuditError, sameRevision } = load('lib/longitudinal.ts', { '@/services/apiFetch': { apiFetch } });

test('Unicode spans preserve complete characters and reject split emoji', () => {
  assert.deepEqual(codepointSpan('😀 river', 3, 8), { start: 2, end: 7, quote: 'river' });
  assert.throws(() => codepointSpan('😀 river', 1, 2));
  assert.throws(() => codepointSpan('abc', 2, 2));
});
test('Mixed initial pages and concurrent edits have unequal revisions regardless of field order', () => {
  const original = { source: 1, privacy: 2, review: 3 };
  assert.equal(sameRevision(original, { review: 3, privacy: 2, source: 1 }), true);
  assert.equal(sameRevision(original, { source: 2, privacy: 2, review: 3 }), false);
  assert.equal(sameRevision(undefined, original), false);
});
test('Private request verifies authenticated response principal and sends reject-only fence', async () => {
  response = new Response(JSON.stringify({ status: 'current' }), { headers: { 'X-Dream-Principal': 'synthetic-a' } });
  assert.deepEqual(await auditRequest('/longitudinal/profile/', new AbortController().signal, 'GET', undefined, 'synthetic-a'), { status: 'current' });
  assert.equal(recorded.input, '/api/longitudinal/profile/');
  assert.equal(recorded.init.headers['X-Dream-Principal'], 'synthetic-a');
  response = new Response('{}', { headers: { 'X-Dream-Principal': 'synthetic-b' } });
  await assert.rejects(auditRequest('/longitudinal/profile/', new AbortController().signal, 'GET', undefined, 'synthetic-a'), e => e instanceof AuditError && e.status === 401);
});
test('Private requests reject missing principal headers, absolute paths and aborted loads', async () => {
  response = new Response('{}');
  await assert.rejects(auditRequest('/longitudinal/profile/', new AbortController().signal, 'GET', undefined, 'synthetic-a'));
  await assert.rejects(auditRequest('//other-service/private', new AbortController().signal));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(auditRequest('/longitudinal/profile/', controller.signal, 'GET', undefined, 'synthetic-a'), e => e.name === 'AbortError');
});

test('Legacy source reset guard verifies principal, honors cancellation and fails closed', async () => {
  let shouldFail = false, confirmations = 0, alerts = 0;
  const calls = [];
  const guard = load('lib/sourceResetGuard.ts', { '@/services/apiFetch': { privateRequestGeneration: () => 0 }, './longitudinal': { auditRequest: async (...args) => {
    calls.push(args);
    if (args[0] === '/auth/session/') return { user: { id: 'synthetic-a' }, loginDeadline: '2026-10-10T12:00:00Z' };
    if (shouldFail) throw new Error('synthetic unavailable');
    return { enabled: true, warning: 'Reset private reviews', private_reviews_reset: 2, merges_reset: 0, linked_reflections: 1 };
  } } });
  global.window = { confirm: warning => { assert.equal(warning, 'Reset private reviews'); confirmations++; return false; }, alert: () => { alerts++; } };
  try {
    assert.equal(await guard.confirmSourceReset(), false);
    assert.equal(calls[1][4], 'synthetic-a');
    assert.equal(confirmations, 1);
    shouldFail = true;
    assert.equal(await guard.confirmSourceReset(), false);
    assert.equal(alerts, 1);
    assert.equal(confirmations, 1);
    assert.ok(calls.every(call => call[2] === undefined || call[2] === 'GET'));
  } finally { delete global.window; }
});

test('Source reset ticket captures the preview revision and rejects an account switch after confirmation', async () => {
  let switchAccount = false, sessionCalls = 0, alerts = 0;
  const revision = { source: 5, privacy: 2, review: 9 };
  const guard = load('lib/sourceResetGuard.ts', { '@/services/apiFetch': { privateRequestGeneration: () => 0 }, './longitudinal': { auditRequest: async (path, signal, method, data, principal) => {
    assert.equal(signal.aborted, false);
    if (path === '/auth/session/') { sessionCalls++; return { user: { id: switchAccount && sessionCalls % 2 === 0 ? 'synthetic-b' : 'synthetic-a' }, loginDeadline: '2026-10-10T12:00:00Z' }; }
    assert.equal(principal, 'synthetic-a');
    return { enabled: true, warning: 'Reset private reviews', revision };
  } } });
  global.window = { confirm: () => true, alert: () => { alerts++; } };
  try {
    assert.deepEqual(await guard.captureSourceReset(), { expected_revision: revision, expected_principal: 'synthetic-a',
      expected_session: '2026-10-10T12:00:00Z', expected_source: null, expected_operation: 'preview' });
    switchAccount = true;
    assert.equal(await guard.captureSourceReset(), null);
    assert.equal(alerts, 1);
  } finally { delete global.window; }
});
