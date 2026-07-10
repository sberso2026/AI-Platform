# Application Installation

`commercial_application_installations` is the **authoritative** source of truth for application installation lifecycle.

## Ownership boundary

| Concern | Table | Role |
|---------|-------|------|
| Commercial status, version, entitlement linkage | `commercial_application_installations` | Source of truth |
| Runtime enabled flag, engineering registry join | `engineering_application_installations` | Derived runtime registration |

`engineering_application_installations` must not independently decide commercial or installation status. Runtime rows are synced from commerce state during provisioning, suspend, resume, and uninstall.

## API routes

- `GET/POST /api/platform/app-installations`
- `GET /api/platform/app-installations/[id]`
- `POST .../start`, `.../suspend`, `.../resume`, `.../upgrade`, `.../rollback`, `.../uninstall`
- `GET .../health`, `.../events`

All mutation routes require owner/admin commerce guards.

## Parent dependency

Application installations require an active parent product installation (e.g. Engineering OS before Project Intelligence shell).

## Project Intelligence

Project Intelligence remains a registration and integration shell only. Business features are not rebuilt in Phase 3.
