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
account provisioning is performed by this PR.

Every private request captures the accepted UUID principal, fixed deadline and
client request generation. Rejection-only `X-Dream-Principal`/`X-Dream-Session`
headers prevent a stale tab's payload from being accepted under a replacement
cookie. Settings/source context changes clear private caches, reload profile/chat
state and abort old requests. A keyed auth boundary recreates the Redux store.

Source mutation tickets capture the displayed source ID, complete hash and update
timestamp, the intended operation and all three private-profile revisions. The
warning precedes any edit/delete; cancellation, interrupted verification or an
account switch stops dispatch. The backend compares the ticket under its locks.

The private `/profile` UI supports opt-in local auditing, exact source evidence,
review/rejection undo, reflections and corrections, including disabled, empty,
stale and unavailable states. Provider profile context stays disabled and empty.
Historical analysis notices appear on journal cards/editor, expanded records,
analysis results and workflow views. They explain that legacy results have no
current source/privacy validation and are excluded from current statistics/chat.

Workflow evidence separates literal observations, public references and possible
interpretations, displays bounded coverage and preserves unsaved-draft evidence
without inventing a saved source link. Malformed private evidence fails closed.
Settings labels personas as fictional, excludes medical history and explains
that medical influence has no effect on the existing numerical blend.

```bash
rtk proxy node --test lib/longitudinal.test.cjs tests/auth-security.cjs
rtk proxy node --experimental-strip-types --test utils/workflowEvidence.test.mjs
rtk proxy node node_modules/typescript/bin/tsc --noEmit
rtk proxy node node_modules/next/dist/bin/next build
```

Sixteen auth/profile client and actual component-render tests plus seven evidence
presenter tests pass. TypeScript and production build use the existing installed
lockfile and bundled Geist fonts. The suite covers proxy gates, CSRF, source
tickets, late JSON, account/context switching and historical notices. Existing
module browser checks used mocked HTTP; full combined browser QA remains unrun
because the required browser-control runtime is unavailable in this task.
No dependency or lockfile change is required for this integration.
