# Vercel environment audit — `rtb-ai-platform`

**Date:** 1 Sep 2026  
**Repository:** RTB AI Platform monorepo  
**Intended Vercel project:** `rtb-ai-platform`  
**Root Directory:** `apps/web`  
**Custom domain (target):** `eos-pilot.rtbea.com.au`  
**Runtime region:** `syd1` (`apps/web/vercel.json`)  
**Certified EOS data plane:** Supabase `wcydlhqiqdwgoaqrlget` (`ap-southeast-2`)  
**Certified web SHA (technical candidate):** `e04a753b7e59e587cc397d8561dd40940b998932`

This audit prepares environment **names and classification** for a Vercel project. It does not deploy, rotate credentials, modify DNS/Supabase, or change application code.

No secret values are recorded here.

---

## 1. File inventory

| Path | Role | Commit? |
|------|------|---------|
| `apps/web/vercel.json` | Install/build from repo root; `regions: ["syd1"]` | yes |
| `.vercelignore` | Excludes cert packages, `.env*`, generated artifacts | yes |
| `.env.example` (repo root) | Canonical **names** for local copy to `apps/web/.env.local` | yes |
| `apps/web/.env.vercel.example` | Vercel placeholder template (this audit) | yes |
| `.env.local` (repo root) | Local secrets; **staging** Supabase URL present | **never** |
| `apps/web/.env.local` | Local secrets; **EOS** Supabase URL present | **never** |
| `apps/web/.env.local.uat008d.bak` | Backup of web local env | **never** |
| `out/full/apps/web/.env.local` | Generated deploy scratch (`VERCEL_OIDC_TOKEN`) | **never** |
| `.tmp-pi-baseline/.env.example` | Historical Personal-AI / Thor / Resend / Zoom inventory | ignored (`.tmp-pi-baseline/`) |
| `.tmp-pi-baseline/.env.production-readiness.example` | Historical PI production-readiness names | ignored |
| `.tmp-pi-baseline/services/document-parser-service/.env.example` | Parser microservice | ignored |

No `.env.development*` or `.env.production*` files exist in the live tree.

### Vercel / config references

- `apps/web/vercel.json` — framework Next.js; install `cd ../.. && pnpm install --frozen-lockfile`; build `cd ../.. && pnpm --filter @rtb/web build`; region `syd1`.
- `docs/operations/AI_PLATFORM_PRODUCTION_DEPLOYMENT.md` — team `rtbea`, project `rtb-ai-platform`, root `apps/web`, preferred custom domain previously `engineering-os-pilot.rtbea.com.au` (this audit’s target is `eos-pilot.rtbea.com.au`).
- GitHub workflows inject `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `COMMERCE_AUTH_SECRET`, `COMMERCE_SCHEDULER_SECRET` as **CI secrets**, not as Vercel dashboard exports.
- Platform-injected at runtime (do not paste): `VERCEL_URL`, `VERCEL_ENV`, `VERCEL_REGION`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`, `VERCEL_DEPLOYMENT_ID`, `NODE_ENV`.

---

## 2. Runtime graph (`apps/web`)

`apps/web` depends on: `@rtb/engineering-os`, `@rtb/platform-core`, `@rtb/platform-kernel`, `@rtb/platform-commerce`, `@rtb/project-intelligence`, `@rtb/project-controls`, `@rtb/inspection-intelligence`, `@rtb/asset-intelligence`, `@rtb/digital-twin`, `@rtb/engineering-model-interoperability`, `@rtb/engineering-execution-host`, `@rtb/database`, `@rtb/types`, `@rtb/ui`.

Certification packages (`*-certification`) are excluded by `.vercelignore` and are **not** Vercel runtime.

`process.env` actually read on the web runtime path:

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | middleware, SSR/browser Supabase clients, service client, build-identity, deployment status |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | middleware, SSR/browser clients |
| `SUPABASE_SERVICE_ROLE_KEY` | `apps/web/src/lib/supabase/service.ts`, PI executive dashboard |
| `NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE` | access snapshot / nav packaging (default `ESSENTIAL`) |
| `NEXT_PUBLIC_APP_URL` | `/api/deployment/status` presence check only |
| `NEXT_PUBLIC_BUILD_SHA` | build-identity fallback (optional) |
| `VERCEL_URL` | invite `redirectTo` (`identity/members`); deployment status |
| `VERCEL_*` / `GITHUB_SHA` | build-identity |
| `SUPABASE_PROJECT_REF` | build-identity fallback |
| `CUSTOMER_ADMIN_CERTIFICATION_TARGET` | build-identity (cert; omit on pilot) |
| `COMMERCE_SCHEDULER_SECRET` | commerce / PI document / meeting / teams job POST routes |
| `COMMERCE_AUTH_SECRET` | `@rtb/platform-commerce` HMAC (**hardcoded dev default if unset**) |
| `RTB_ENFORCE_PRIVILEGED_MFA` | middleware; also on when `VERCEL_ENV=production` **or** `NODE_ENV=production` |
| `PI_TEAMS_*` / `MICROSOFT_GRAPH_WEBHOOK_CLIENT_STATE` | Graph webhook routes + PI Teams token service |
| `PROJECT_INTELLIGENCE_CERTIFICATION` | PI documents-service / embedding hash fallback (cert) |
| `OPENAI_API_KEY` / `PLATFORM_EMBEDDING_*` | `@rtb/project-intelligence` governed embeddings |
| `AZURE_DOCUMENT_INTELLIGENCE_*` | `@rtb/project-intelligence` parser router |
| `ASSET_INTELLIGENCE_REPOSITORY_ADAPTER` | asset-intelligence routes (default `postgres`) |
| `PROJECT_CONTROLS_REPOSITORY_ADAPTER` | project-controls routes (default `postgres`) |
| `DIGITAL_TWIN_REPOSITORY_ADAPTER` | digital-twin routes (default `postgres`) |
| `ENGINEERING_MODEL_REPOSITORY_ADAPTER` | model interoperability persistence |
| `EXECUTION_HOST_REPOSITORY_ADAPTER` | execution host persistence |

Engineering OS Ask (`@rtb/engineering-os`) is **lexical/grounded retrieval**. It does not read `OPENAI_API_KEY`. Certified EOS Ask on the Gold Coast project succeeded without treating LLM generation as the path.

Auth **email/SMTP is not a Vercel variable**. Invite/signup mail is GoTrue/Supabase Auth (hosted mailer or custom SMTP in the Supabase project).

---

## 3. Classification (deduplicated)

### REQUIRED_PUBLIC

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Must be EOS project `https://wcydlhqiqdwgoaqrlget.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable anon key for that project |
| `NEXT_PUBLIC_APP_URL` | `https://eos-pilot.rtbea.com.au` — used by deployment status; operators should still add `eos-pilot.rtbea.com.au` to Supabase Auth URL allow-list |

### REQUIRED_SERVER_SECRET

| Variable | Notes |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only; never `NEXT_PUBLIC_*` |
| `COMMERCE_AUTH_SECRET` | Must be set; code default `rtb-dev-commerce-auth-secret` is not acceptable on a shared HTTPS origin |
| `COMMERCE_SCHEDULER_SECRET` | Protects `/api/platform/commerce/jobs/run` and PI job runners |

### OPTIONAL (EOS pilot)

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE` | Default `ESSENTIAL` if unset |
| `OPENAI_API_KEY` or `PLATFORM_EMBEDDING_API_KEY` | PI document embeddings only |
| `PLATFORM_EMBEDDING_BASE_URL` / `MODEL` / `REGION` / `PROVIDER` | Embedding routing |
| `AZURE_DOCUMENT_INTELLIGENCE_*` | Document parse/OCR |
| `PI_TEAMS_*` | Teams live integration — **not** required for EOS core registers/Ask |
| `SUPABASE_PROJECT_REF` | Cosmetic for build-identity if URL already encodes ref |
| `RTB_ENFORCE_PRIVILEGED_MFA` | Redundant on Vercel: `NODE_ENV=production` already enables privileged MFA middleware |
| `*_REPOSITORY_ADAPTER` | Leave unset or `postgres` |

### BUILD_ONLY / platform-injected

`VERCEL_URL`, `VERCEL_ENV`, `VERCEL_REGION`, `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF`, `VERCEL_DEPLOYMENT_ID`, `NODE_ENV`, `npm_package_version`.

Do not import `VERCEL_OIDC_TOKEN` from local files.

### LOCAL_ONLY / TEST_CERT_ONLY — do not copy to pilot Vercel

`CERT_USER_PASSWORD`, `RTB_TEST_BASE_URL`, `SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`, `SUPABASE_URL` / `SUPABASE_ANON_KEY` (aliases; web runtime uses `NEXT_PUBLIC_*`), `PROJECT_INTELLIGENCE_CERTIFICATION`, `PI_PROVIDER_CERTIFICATION`, `PLATFORM_EMBEDDING_ALLOW_STAGING_HASH`, `CUSTOMER_ADMIN_*`, `ALLOW_PRODUCTION_CERTIFICATION`, `CERTIFY_*`, `GITHUB_*`, `COMMERCE_RLS_*`, `PI_TEAMS_TEST_MEETING_URL`, `PI_TEAMS_TEST_ORGANIZER_USER_ID`, `PI_TEAMS_TEST_PROVIDER_MEETING_ID`.

### OBSOLETE_OR_UNUSED for `apps/web` Vercel

From `.tmp-pi-baseline` / Personal AI freeze, **not** referenced by current `apps/web` runtime: `ZOOM_BOT_*`, `TEAMS_BOT_*`, `GOOGLE_MEET_BOT_*`, `RESEND_*`, `THOR_*`, `NEXT_PUBLIC_THOR_*`, `NEXT_PUBLIC_RTB_MEETING_WELCOME_VOICE`, `REALTIME_PIPELINE_*`, `ALLOW_FOUNDER_*`, `RTB_FOUNDER_*`, `DOCUMENT_PARSE_API_*` (current parser uses Azure env names), `MOM_EXPORT_*`, `GRAPH_*` (legacy aliases still accepted in PI Teams code; prefer `PI_TEAMS_*` if Teams is enabled).

---

## 4. Security audit

### Client / server boundary

| Check | Result |
|-------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` on `NEXT_PUBLIC_*` | **Not found** in code or local public keys |
| Provider keys (`OPENAI_*`, Azure, Teams client secret) in `NEXT_PUBLIC_*` | **Not found** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Expected public (RLS-enforced). Not a leak. |
| `COMMERCE_AUTH_SECRET` unset | **Risk:** falls back to a well-known dev string in `@rtb/platform-commerce` |
| Privileged MFA | Enforced whenever `NODE_ENV=production` (all Vercel deployments) |

**SECRET_EXPOSURE_FOUND = false** for client-bundled service-role/admin keys.

### Conflicting local files (do not import blindly)

| Variable | Conflict |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Repo-root `.env.local` → **staging** ref `rntonzigxwxcjlcsadip`. `apps/web/.env.local` → **EOS** ref `wcydlhqiqdwgoaqrlget`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Distinct fingerprints across root local vs web local vs examples. |
| `COMMERCE_SCHEDULER_SECRET` | Example placeholder vs root `.env.local` live value. |

Certified EOS pilot configuration is **`apps/web/.env.local` + hosted `wcydlhqiqdwgoaqrlget`**, not repo-root `.env.local`.

**ENV_CONFLICTS_FOUND = true** in the working tree. The Vercel project must be populated from the **EOS** pair only.

### Localhost / preview URLs

- `RTB_TEST_BASE_URL` in repo-root `.env.local` is localhost — **LOCAL_ONLY**.
- No `*.vercel.app` preview URLs stored as env values in local files.
- Invite activation currently prefers `VERCEL_URL` (typically `*.vercel.app`) over the browser `Origin`. Signup uses `window.location.origin`. After custom domain cutover, add `https://eos-pilot.rtbea.com.au/**` to Supabase Auth redirect allow-list. Do not point Auth `site_url` at `http://localhost:3000`.

### Credentials that must not be copied to the new project

- `CERT_USER_PASSWORD`
- `VERCEL_OIDC_TOKEN` (machine-local)
- Staging (`rntonzigxwxcjlcsadip`) URL/keys
- Intranet staging (`ckvjtrnimpltoevgcgtm`) SMTP password or keys
- UAT / Mail.tm / cert fixture passwords
- Teams **test** meeting URLs and organizer IDs unless that tenant is in scope

---

## 5. Engineering OS external pilot requirements

Preserve the **shared** RTB AI Platform stack. Do not create a second Auth/AI/database.

| Concern | Requirement |
|---------|-------------|
| Data / Auth | Existing EOS Supabase `wcydlhqiqdwgoaqrlget` |
| Web | Same `apps/web` composition; region `syd1` |
| Domain | `https://eos-pilot.rtbea.com.au` (DNS is out of this audit) |
| Email | Supabase Auth mailer (built-in or custom SMTP). **Not** a Vercel `SMTP_*` var. Built-in rate limit remains 2/hour until SMTP is configured **in Supabase**. |
| EOS Ask | No extra model key required for lexical grounded Ask |
| Entitlements | `COMMERCE_AUTH_SECRET` + existing commerce schema on the same project |
| Teams / Zoom / Thor / Resend | Out of EOS core pilot unless product explicitly enables them |

Compared with certified candidate evidence:

- Matching: `NEXT_PUBLIC_SUPABASE_URL` EOS ref, service role present locally for web, `syd1` in `vercel.json`, invite uses `VERCEL_URL` for `redirectTo`.
- Gap vs custom domain: `NEXT_PUBLIC_APP_URL` is not what invite `redirectTo` reads (`VERCEL_URL` is). Plan Auth allow-list for both `*.vercel.app` and `eos-pilot.rtbea.com.au` until code is allowed to prefer the custom origin.
- Gap: repo-root `.env.local` is the **wrong** Supabase project for this Vercel app.

---

## 6. Vercel setup table

Scope: set the same values on **Production** and **Preview** unless noted. **Development** (Vercel) is unused if engineers use local `.env.local`.

| VARIABLE | REQUIRED | SCOPE | SOURCE | PUBLIC/SECRET | ACTION |
|----------|----------|-------|--------|---------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Production, Preview | Supabase EOS project Settings → API | PUBLIC | Set to EOS URL only. Do not use staging. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Production, Preview | Supabase EOS anon key | PUBLIC | Copy anon key for `wcydlhqiqdwgoaqrlget`. |
| `NEXT_PUBLIC_APP_URL` | yes | Production, Preview | Operator (known hostname) | PUBLIC | `https://eos-pilot.rtbea.com.au` |
| `NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE` | no | Production, Preview | Product default | PUBLIC | Optional; `ESSENTIAL` if set. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Production, Preview | Supabase EOS service_role | SECRET | Server only. |
| `COMMERCE_AUTH_SECRET` | yes | Production, Preview | Existing `rtb-ai-platform` Vercel env **or** generate new HMAC secret | SECRET | Must not use code default. Prefer reuse of existing project secret if this is the same app. |
| `COMMERCE_SCHEDULER_SECRET` | yes | Production, Preview | Existing Vercel env **or** generate | SECRET | Same as certified deployment if sharing job callers. |
| `OPENAI_API_KEY` | no | Production, Preview | OpenAI/provider | SECRET | Optional for EOS Ask; required for PI embeddings. |
| `PLATFORM_EMBEDDING_API_KEY` | no | Production, Preview | Same provider as embeddings | SECRET | Preferred over `OPENAI_API_KEY` if both exist. |
| `PLATFORM_EMBEDDING_BASE_URL` | no | Production, Preview | Provider docs | PUBLIC-ish | Default OpenAI v1 if unset. |
| `PLATFORM_EMBEDDING_MODEL` | no | Production, Preview | Provider docs | PUBLIC-ish | Default `text-embedding-3-small`. |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | no | Production, Preview | Azure | PUBLIC-ish | Optional OCR. |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | no | Production, Preview | Azure | SECRET | Optional OCR. |
| `PI_TEAMS_*` | no | Production, Preview | Existing Vercel / Azure AD app | mix | Omit for EOS-only pilot. |
| `SUPABASE_PROJECT_REF` | no | Production, Preview | Known: `wcydlhqiqdwgoaqrlget` | PUBLIC | Optional; URL already encodes ref. |
| `VERCEL_URL` / `VERCEL_ENV` / `VERCEL_REGION` | n/a | injected | Vercel | PUBLIC | Do not set. Confirm region `syd1` in project settings + `vercel.json`. |

Email: configure in **Supabase Auth** (redirect URLs, SMTP). Not in this table.

---

## 7. Values that must be obtained (do not guess)

| Name | Obtain from |
|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard for `wcydlhqiqdwgoaqrlget` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | same (service_role) |
| `COMMERCE_AUTH_SECRET` | Existing Vercel project `rtb-ai-platform` env, if this is a re-bind of the same app; otherwise generate and store in a secret manager |
| `COMMERCE_SCHEDULER_SECRET` | Existing Vercel project env or generate |
| `OPENAI_API_KEY` / `PLATFORM_EMBEDDING_API_KEY` | OpenAI (or chosen embedding provider) — only if PI embeddings are in pilot scope |
| `AZURE_DOCUMENT_INTELLIGENCE_*` | Azure — only if OCR is in pilot scope |
| `PI_TEAMS_CLIENT_SECRET` and related | Azure AD app + existing Vercel — only if Teams is in scope |
| SMTP username/password | Mail operator secret (e.g. `mail.rtbea.com.au`). **Supabase Auth SMTP**, not Vercel. Management API `smtp_pass` is redacted — do not copy it. |

`NEXT_PUBLIC_APP_URL` is the stated hostname `https://eos-pilot.rtbea.com.au` (not a secret). DNS/Vercel domain binding is out of scope for this audit.

---

## 8. Bulk import

**VERCEL_BULK_IMPORT_SAFE = false**

Reasons:

1. Repo-root `.env.local` points at **staging** Supabase, not EOS.
2. Local files mix cert passwords, OIDC tokens, Teams test URLs, and duplicate keys.
3. `.env*` bulk upload would include `LOCAL_ONLY` / `TEST_CERT_ONLY` names.
4. Platform-injected vars and `VERCEL_OIDC_TOKEN` must not be imported.
5. SMTP does not belong in a Vercel env file.

Use `apps/web/.env.vercel.example` as a **checklist**. Enter Production + Preview values manually (or a curated subset exported from the **existing** Vercel project after reviewing each name). Do not `vercel env pull` from local and push wholesale.

---

## 9. Validation

- Secret values are not in this document or `.env.vercel.example`.
- `.gitignore` allows `.env.example` and `apps/web/.env.vercel.example` only among `.env*` templates.
- Every `apps/web` + runtime-package `process.env` name used for hosted EOS is classified above.
- Duplicate/conflicting local Supabase projects are reported.
- Client/server secret boundary checked: no service-role on `NEXT_PUBLIC_*`.

**DEPLOYMENT_ENV_READY = false** until the new/rebound Vercel project has the required public + server secrets set to EOS values, Auth redirect allow-list includes the custom domain, and SMTP remains an operator Supabase task. This audit does not deploy.
