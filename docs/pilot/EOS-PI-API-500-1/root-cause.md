# EOS-PI-API-500-1 root cause

## Defect

Authenticated Project Intelligence pages rendered shell and navigation, then failed with:

`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

Affected founder views: Overview, Schedule, Cost & Progress. Sibling intelligence routes shared the same failure.

## Live Preview evidence (pre-repair)

Preview SHA `781f816c17837b537f5384d1b50b4beabd739bb0` / `dpl_2PgbFMZp27Y97Ssdo85wt8JN9K16`.

Unauthenticated probes:

| Route | Status | Content-Type | Prefix |
|---|---|---|---|
| `GET /api/engineering/dashboard` | 401 | application/json | `{"ok":false` |
| `GET /api/engineering/project-intelligence/health` | 500 | text/html | `<!DOCTYPE html>` |
| `GET /api/engineering/project-intelligence/projects/{id}/command-centre` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../schedule` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../cost-progress` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../risk-change` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../queries-decisions` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../reports` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../analyst` | 500 | text/html | `<!DOCTYPE html>` |
| `GET .../forecasting` | 500 | text/html | `<!DOCTYPE html>` |

Vercel runtime logs for project `b35e0b5e-e404-4d4f-8926-0992f55b1696`:

```
Error: Cannot find module 'pdf-parse'
Require stack: .../command-centre/route.js
.../schedule/route.js
.../cost-progress/route.js
.../analyst/route.js
```

This is **not** the Command Center `DOMMatrix` crash. It is `MODULE_NOT_FOUND` during PI route module evaluation, before `withEngineeringApi` can return JSON. Next.js then renders HTML `/500`. The browser called `response.json()` and surfaced the parse error.

## Failure chain

1. EOS-COMMAND-500-1 webpack-externalized `pdf-parse` for all server bundles (`commonjs pdf-parse`).
2. Generic PI routes imported `@rtb/project-intelligence/server` via `access.ts`.
3. `server.ts` re-exported `documents/parser-routing` and `documents/document-worker`.
4. Those pull `native-parsers.ts` → `from "pdf-parse"`.
5. Intelligence lambdas `require("pdf-parse")` at init. The module is not in that function's traced modules → crash → HTML 500.

```
PI_FAILURE_LAYER=module initialization (before handler)
PI_FAILURE_ROOT_CAUSE=Cannot find module 'pdf-parse' because generic PI APIs transitively imported the parser barrel while pdf-parse is webpack-externalized
PI_SHARED_FAILURE_COMPONENT=access.ts → @rtb/project-intelligence/server → parser-routing/document-worker → native-parsers → pdf-parse
```

Middleware does **not** redirect `/api/*` to HTML login.

## Repair

- `@rtb/project-intelligence/access` — leaf access guards
- `@rtb/project-intelligence/server` — server services, no parser re-exports
- `@rtb/project-intelligence/parsers` — document processing routes and jobs only
- PI APIs return `{ ok:true, data }` / `{ ok:false, error:{ code, message, requestId, dataset } }`
- Client uses `parseApiJsonResponse` + bounded Retry / Show details
- Failed loads stay `data: null`; they are never coerced to zero
