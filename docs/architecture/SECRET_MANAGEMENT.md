# Secret Management

## Purpose

Tenant-scoped secret metadata, versions, permissions, and access audit for RTB AI Platform. Stores encrypted values or external references — never logs plaintext secret material in API responses.

## Service Class

`SecretManagementService` — `@rtb/platform-intelligence`

Key methods: `listSecrets` (metadata only), `createSecret`, rotate/revoke, `logAccess(SecretAccessInput)`.

## Key Tables

| Table | Role |
|-------|------|
| `secrets` | Secret header (key, scope, storage type, rotation due) |
| `secret_versions` | Encrypted value or external ref per version |
| `secret_access_logs` | read / rotate / revoke audit |
| `secret_permissions` | Principal grants |

**Scopes:** tenant, workspace, project, plugin, integration, agent, tool  
**Storage:** `encrypted` | `external_ref`

List APIs deliberately omit decrypted values.

## API Route

`GET|POST /api/platform/secrets`  
→ `kernel.intelligence.secrets`

## UI Route

`/platform/secrets`

## Integration Points

- **Model Registry** — provider API keys
- **Tool Registry** — tool credentials
- **Plugins / Integrations** — plugin-scoped secrets
- **AI Director** — resolve secrets at runtime via permissions, not by embedding in prompts
- **Audit** — access logs feed compliance review
