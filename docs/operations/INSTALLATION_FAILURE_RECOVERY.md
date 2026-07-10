# Installation Failure Recovery

## Failed provisioning

1. Check `commercial_installation_failures` and installation events
2. Scheduler `installationRetry` re-queues failed installations
3. Manual retry: transition to `requested` and `POST .../start` (applications) or re-request install (products)

## Degraded after upgrade

1. Check health endpoint
2. Rollback to `metadata.pre_upgrade_version` via `POST .../rollback`
3. Rollback fails explicitly when target version is unsupported or health validation fails

## Stale authorization

If access persists after suspension, verify `commercial_installation_versions` bumped and entitlement cache version check is active.

## Force uninstall

Platform staff may pass `force: true` on uninstall when dependencies are resolved or override is authorized (audited).
