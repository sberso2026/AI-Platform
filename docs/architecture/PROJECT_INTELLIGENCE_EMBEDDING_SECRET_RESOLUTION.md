# Project Intelligence — Embedding Secret Resolution

**Redacted configuration report (names and presence only — never values).**

## Precedence

| Priority | Variable | Activates |
|----------|----------|-----------|
| 1 | `PLATFORM_EMBEDDING_API_KEY` | Primary Platform-governed embedding credential |
| 2 | `OPENAI_API_KEY` | Fallback credential when Platform key is unset |

Resolution in `GovernedEmbeddingAdapter`:

```
apiKey = PLATFORM_EMBEDDING_API_KEY ?? OPENAI_API_KEY
baseUrl = PLATFORM_EMBEDDING_BASE_URL ?? https://api.openai.com/v1
model = PLATFORM_EMBEDDING_MODEL ?? text-embedding-3-small
```

## Provider selection

| Condition | Provider kind | Endpoint |
|-----------|---------------|----------|
| Key present and base URL contains `openai.azure.com` | `azure-openai` | `PLATFORM_EMBEDDING_BASE_URL` (required for Azure) |
| Key present otherwise | `openai` | default `https://api.openai.com/v1` or override |
| No key in `unit_test` / `local_development` with explicit hash allow | `platform-staging-hash` | n/a (forbidden in provider cert) |

## Model and dimensions

- Model: `text-embedding-3-small`
- Requested dimensions: **1536**
- Database vector column: `vector(1536)`
- Activation guard rejects any declared dimension ≠ 1536

## Ambiguous routing

When **both** `PLATFORM_EMBEDDING_API_KEY` and `OPENAI_API_KEY` are set, `PLATFORM_EMBEDDING_PROVIDER` must be explicitly `openai` or `azure-openai`. Otherwise preflight fails (ambiguous provider routing).

When `PLATFORM_EMBEDDING_BASE_URL` points at Azure OpenAI, that base URL is required and provider must resolve to `azure-openai`.

## Azure Document Intelligence (parser + OCR)

| Variable | Purpose |
|----------|---------|
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Resource endpoint (no trailing slash required; stripped in code) |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | Server-only subscription key |
| `AZURE_DOCUMENT_INTELLIGENCE_MODEL` | Optional layout model (default `prebuilt-layout`) |
| `AZURE_DOCUMENT_INTELLIGENCE_OCR_MODEL` | Optional OCR model (default `prebuilt-read`) |

One Azure DI credential pair supports both layout (advanced parser) and read (OCR) adapters.

`platform-ocr-local` and `platform-structured` are not production OCR / cloud parser proof for hosted production readiness.

## GitHub jobs receiving secrets

| Job | Embedding secrets | Azure DI secrets | Browser public keys only |
|-----|-------------------|------------------|--------------------------|
| preflight | yes | yes (presence check) | supabase public + service |
| validate | no | no | supabase public (build) |
| provider-configuration | no | no | no |
| hosted-schema | no | no | service role |
| provider-processing | no | yes | no |
| semantic-evaluation | yes | no | no |
| failure-recovery | no | no | no |
| multi-worker | yes | yes | service role |
| browser-certification | yes (server process) | yes (server process) | public + service; **build step must not receive provider keys** |
| release-evidence | yes | yes | yes |

## Hosted presence checklist (fill at cert time)

| Name | Present |
|------|---------|
| `PLATFORM_EMBEDDING_API_KEY` | see artifact `providerSecretsPresent` |
| `OPENAI_API_KEY` | see artifact `providerSecretsPresent` |
| `PLATFORM_EMBEDDING_BASE_URL` | optional for OpenAI default |
| `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | required for production readiness |
| `AZURE_DOCUMENT_INTELLIGENCE_KEY` | required for production readiness |
