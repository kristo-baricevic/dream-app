# Session-authenticated frontend

The pink/cloud login page uses labelled username/password inputs with autofill,
recoverable errors and guarded submission. Private dashboard components render
under `AuthProvider`/`AuthGate`; the server-rendered entry is checked against the
active UUID owner before displaying cached props. A new Redux store is created
for each session. Late private requests/JSON are discarded after session changes.
Focus/timer checks enforce the fixed server deadline; cross-tab changes reload
private content. Logout clears the UI after server confirmation and remains
retryable when the service is unavailable.

All browser API requests use same-origin `apiFetch` through `/api`, `/fastapi` and
`/chat`. Unsafe requests carry Django CSRF; cookies are same-origin and no-store.
Private 401 responses invalidate the session, while rejected login credentials
leave the form usable. Redirect return paths are parsed and restricted to this
origin. The Next proxy forwards only allowlisted headers to fixed destinations,
rejects redirects/traversal and requires HTTPS before forwarding production
credentials. Backend owns authentication and UUID data ownership.

Configure server-only `DREAM_DJANGO_URL`, `DREAM_ANALYZER_URL`, `DREAM_CHAT_URL` and
`DREAM_ENV`. For the backend's isolated loopback project use local environment,
localhost:3100 frontend and ports 15400/15401/15402 respectively. There is no
default credential or browser-public service URL. Optional
`DREAM_EDGE_SETS_CLIENT_IP=1` is permitted only behind an edge that overwrites the
attestation header and prevents direct BFF access; backend peer trust is explicit.

This frontend requires the coordinated backend auth migration/configuration and
an approved isolated account before an actual login session. No deployment or
account provisioning is performed by this PR. Longitudinal profile source and
principal/revision-fence integration are a coordinated follow-up; provider
context remains disabled pending combined retention/revocation verification.

```bash
rtk proxy node --test tests/auth-security.cjs
rtk proxy node node_modules/typescript/bin/tsc --noEmit
rtk proxy node node_modules/next/dist/bin/next build
```

Six original-module security/render tests, TypeScript and production build pass.
Interactive combined login/logout/session interruption QA remains a separate
check; the automated suite covers safe routing, proxy gates, CSRF, stale JSON,
private 401 behavior and actual login component markup/style. No dependency or
lockfile change is required.
