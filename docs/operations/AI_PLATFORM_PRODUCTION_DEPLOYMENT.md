# AI Platform — Production Deployment Foundation (Phase 6C-3E.0)

**Product:** Engineering OS / AI Platform (`apps/web`)  
**Purpose:** Public HTTPS origin for Microsoft Graph webhook callbacks before Phase 6C-3E live Teams certification.

## Topology

```
Microsoft Graph
  → POST https://<AI_PLATFORM_ORIGIN>/api/webhooks/microsoft-graph?validationToken=…
  → POST https://<AI_PLATFORM_ORIGIN>/api/webhooks/microsoft-graph  (notifications + clientState)

Browser / CI smoke
  → GET  /api/health
  → GET  /api/platform/build-identity
  → GET  /api/deployment/status
  → GET  /deployment
```

## Hostnames

| Host | Role |
|------|------|
| Vercel production URL (`*.vercel.app`) | Immediate Graph-reachable HTTPS origin |
| `engineering-os-pilot.rtbea.com.au` | Preferred custom domain (requires DNS CNAME to Vercel) |
| `pilot.rtbea.com.au` | **Personal AI** — do not use for AI Platform webhooks |

Set GitHub / Vercel secret `PI_TEAMS_WEBHOOK_BASE_URL` to the AI Platform **origin only** (no path). Code appends `/api/webhooks/microsoft-graph`.

## Vercel

- Team: `rtbea`
- Project: `rtb-ai-platform`
- Root directory: `apps/web`
- Install: `cd ../.. && pnpm install --frozen-lockfile`
- Build: `cd ../.. && pnpm --filter @rtb/web build`
- Region: `syd1` preferred

## Environment variables (names only)

Required for runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended for Teams live cert readiness:

- `PI_TEAMS_WEBHOOK_BASE_URL`
- `PI_TEAMS_GRAPH_MODE=live`
- `PI_TEAMS_TENANT_ID`
- `PI_TEAMS_CLIENT_ID`
- `PI_TEAMS_CLIENT_SECRET`
- `PI_TEAMS_WEBHOOK_CLIENT_STATE`
- `PI_TEAMS_TEST_TENANT_LABEL`

Never commit values. Never log tokens or client secrets.

## Smoke

```powershell
$env:SMOKE_BASE_URL="https://<AI_PLATFORM_ORIGIN>"
node scripts/qa-platform-deployment-production.mjs
node scripts/qa-microsoft-graph-webhook-production.mjs
```

## Certification workflow

`.github/workflows/project-intelligence-phase-6c3e0-platform-deployment-certification.yml`

## Production checklist

1. Deploy `rtb-ai-platform` to Vercel production.
2. Confirm DNS (custom domain) or use `*.vercel.app`.
3. Smoke health, build-identity, webhook validationToken.
4. Update `PI_TEAMS_WEBHOOK_BASE_URL` to the deployed origin.
5. Proceed to Phase 6C-3E live Teams certification.
