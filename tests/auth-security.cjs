const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');

function load(relative, globals = {}, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  const context = vm.createContext({ module, exports: module.exports,
    require: (name) => mocks[name] || require(name), URL, Headers, Response, AbortController, DOMException,
    process: { env: {} }, ...globals });
  vm.runInContext(code, context, { filename: relative });
  return { api: module.exports, context };
}

test('return paths reject external origins and URL-parser control normalization', () => {
  const { api } = load('utils/authRouting.ts');
  for (const next of ['//evil.example', '/\n/evil.example', '/\t/evil.example', '/\\evil.example', 'https://evil.example']) {
    assert.equal(api.safeNextPath(next, 'https://browser.example'), '/journal');
  }
  assert.equal(api.safeNextPath('/journal/owned-id?view=entry', 'https://browser.example'), '/journal/owned-id?view=entry');
});

test('proxy canonicalizes Django slash and drops untrusted forwarding headers', async () => {
  let observed;
  const { api } = load('services/serverProxy.ts', { process: { env: { DREAM_DJANGO_URL: 'https://django.example', DREAM_ENV: 'production' } },
    fetch: async (url, init) => { observed = { url, init }; return Response.json({ ok: true }); } });
  const request = { headers: new Headers({ cookie: 'synthetic-cookie', origin: 'https://browser.example',
    host: 'browser.example', 'x-forwarded-for': 'forged', 'x-dream-client-ip': 'forged', 'x-forwarded-proto': 'https' }),
    method: 'GET', nextUrl: new URL('https://browser.example/api/auth/csrf'), signal: new AbortController().signal };
  const response = await api.proxy(request, ['auth', 'csrf'], 'api');
  assert.equal(response.status, 200); assert.equal(observed.url, 'https://django.example/api/auth/csrf/');
  assert.equal(observed.init.headers.get('cookie'), 'synthetic-cookie');
  for (const name of ['x-forwarded-for', 'x-forwarded-proto', 'x-dream-client-ip']) assert.equal(observed.init.headers.has(name), false);
  assert.equal(response.headers.get('cache-control'), 'no-store, private');
});

test('production plain HTTP and path traversal fail before any credential forwarding', async () => {
  let calls = 0;
  const { api, context } = load('services/serverProxy.ts', { process: { env: { DREAM_DJANGO_URL: 'http://django.example' } },
    fetch: async () => { calls++; return Response.json({}); } });
  const request = { headers: new Headers(), method: 'GET', nextUrl: new URL('https://browser.example/api/auth/csrf') };
  assert.equal((await api.proxy(request, ['auth', 'csrf'], 'api')).status, 503);
  context.process.env.DREAM_DJANGO_URL = 'https://django.example';
  assert.equal((await api.proxy(request, ['..'], 'api')).status, 400);
  assert.equal(calls, 0);
});

test('client adds CSRF and discards delayed private JSON after session change', async () => {
  let resolveJson, observed;
  const window = { dispatchEvent() {} };
  const { api } = load('services/apiFetch.ts', { window, Event,
    fetch: async (url, init) => {
      if (url === '/api/auth/csrf/') return Response.json({ csrfToken: 'synthetic-csrf' });
      observed = init;
      const response = Response.json({});
      response.json = () => new Promise((resolve) => { resolveJson = resolve; });
      return response;
    } });
  api.setRequestPrincipal({ user: { id: 'synthetic-a' }, loginDeadline: '2026-10-10T12:00:00Z' });
  const response = await api.apiFetch('/api/entries/create/', { method: 'POST' });
  assert.equal(observed.headers.get('X-CSRFToken'), 'synthetic-csrf');
  assert.equal(observed.credentials, 'same-origin'); assert.equal(observed.cache, 'no-store');
  const delayed = response.json(); api.clearPrivateRequests(); resolveJson({ content: 'synthetic old account' });
  await assert.rejects(delayed, (error) => error.name === 'AbortError');
});

test('unauthenticated private response invalidates, while bad credentials keep login retryable', async () => {
  let events = 0;
  const { api } = load('services/apiFetch.ts', { window: { dispatchEvent() { events++; } }, Event,
    fetch: async (url) => url === '/api/auth/csrf/' ? Response.json({ csrfToken: 'synthetic-csrf' }) : new Response('', { status: 401 }) });
  await api.apiFetch('/api/auth/login/', { method: 'POST' }); assert.equal(events, 0);
  api.setRequestPrincipal({ user: { id: 'synthetic-a' }, loginDeadline: '2026-10-10T12:00:00Z' });
  await api.apiFetch('/api/entries/'); assert.equal(events, 1);
});

test('login renders existing cloud/pink style with labelled password and no populated fixture', () => {
  const React = require('react'); const render = require('react-dom/server').renderToStaticMarkup;
  const { api } = load('app/login/page.tsx', {}, {
    '@/components/AuthProvider': { useAuth: () => ({ login: async () => {} }) },
    '@/utils/authRouting': { safeNextPath: () => '/journal' } });
  const html = render(React.createElement(api.default));
  assert.match(html, /bg-gradient-to-r from-pink-200/); assert.match(html, /type="password"/);
  assert.match(html, /autoComplete="username"/); assert.match(html, /Welcome back/);
  assert.doesNotMatch(html, /value="admin"/);
});

test('source ticket binds displayed preimage and operation, rejecting a session change during confirmation', async () => {
  let generation = 0; let switched = false;
  const session = { user: { id: 'synthetic-owner' }, loginDeadline: '2026-10-10T12:00:00Z' };
  const preimage = { entry_id: 'synthetic-entry', content_hash: 'a'.repeat(64), updated_at: '2026-10-10T10:00:00Z' };
  const revision = { source: 1, privacy: 2, review: 3 };
  const { api } = load('lib/sourceResetGuard.ts', { window: { alert() {}, confirm() { if (switched) generation++; return true; } } }, {
    './longitudinal': { auditRequest: async path => path.includes('source-reset') ? { revision, enabled: true } : session },
    '@/services/apiFetch': { privateRequestGeneration: () => generation },
  });
  const ticket = await api.captureSourceReset(preimage, 'update');
  assert.equal(ticket.expected_source.entry_id, 'synthetic-entry');
  assert.equal(ticket.expected_source.content_hash, preimage.content_hash);
  assert.equal(ticket.expected_operation, 'update');
  assert.equal(ticket.expected_session, session.loginDeadline);
  switched = true;
  assert.equal(await api.captureSourceReset(preimage, 'delete'), null);
  assert.equal(await api.captureSourceReset(undefined, 'update'), null);
});

test('both proxy directions preserve the reject-only principal header', async () => {
  let forwarded;
  const { api } = load('services/serverProxy.ts', { process: { env: { DREAM_DJANGO_URL: 'https://django.example' } },
    fetch: async (_, init) => { forwarded = init.headers.get('x-dream-principal'); return Response.json({}, { headers: { 'X-Dream-Principal': 'synthetic-owner' } }); } });
  const request = { headers: new Headers({ 'X-Dream-Principal': 'synthetic-owner' }), method: 'GET',
    nextUrl: new URL('https://browser.example/api/longitudinal/profile'), signal: new AbortController().signal };
  const response = await api.proxy(request, ['longitudinal', 'profile'], 'api');
  assert.equal(forwarded, 'synthetic-owner');
  assert.equal(response.headers.get('X-Dream-Principal'), 'synthetic-owner');
});

test('private input stays bound to the accepted account across a switched cookie', async () => {
  let observed;
  const { api } = load('services/apiFetch.ts', { window: { dispatchEvent() {} }, Event,
    fetch: async (url, init) => {
      if (url === '/api/auth/csrf/') return Response.json({ csrfToken: 'synthetic' });
      observed = init;
      // Synthetic server currently has account B's cookie and rejects A's hints.
      return new Response('', { status: 403 });
    } });
  await assert.rejects(api.apiFetch('/api/entries/create/', { method: 'POST' }), e => e.name === 'AbortError');
  api.setRequestPrincipal({ user: { id: 'synthetic-a' }, loginDeadline: '2026-10-10T12:00:00Z' });
  const response = await api.apiFetch('/api/entries/create/', { method: 'POST', body: 'synthetic account-A draft' });
  assert.equal(response.status, 403);
  assert.equal(observed.headers.get('X-Dream-Principal'), 'synthetic-a');
  assert.equal(observed.headers.get('X-Dream-Session'), '2026-10-10T12:00:00Z');
  api.clearPrivateRequests();
  await assert.rejects(api.apiFetch('/api/entries/'), e => e.name === 'AbortError');
});

test('historical provenance is visible without implying current grounding', () => {
  const React = require('react'); const render = require('react-dom/server').renderToStaticMarkup;
  const { api } = load('components/SourceValidationNotice.tsx');
  assert.match(render(React.createElement(api.default, { status: 'historical_unvalidated' })), /Historical interpretation/);
  assert.match(render(React.createElement(api.default, { status: 'historical_unvalidated' })), /have not been validated/);
  assert.equal(render(React.createElement(api.default, { status: 'current' })), '');
});
