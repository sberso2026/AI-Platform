# Installation Versioning

## Tables

- `commercial_installation_versions` — per-tenant counter bumped on installation transitions
- `commercial_entitlement_versions` — per-tenant counter bumped on commerce writes

## Cache contract

Entitlement cache entries store version stamps. On read, current DB versions are fetched; stale entries are rejected without waiting for TTL expiry.

**Consistency bound:** Authorization-changing writes invalidate immediately on the writing instance. Other instances reject stale cached decisions on the next guarded request when DB version differs (typically sub-second after version read).

## Upgrade metadata

`metadata.pre_upgrade_version` records the prior version to support safe rollback to supported previous versions only.
