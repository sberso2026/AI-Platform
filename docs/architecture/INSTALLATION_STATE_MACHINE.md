# Installation State Machine

Product and application installations use explicit state machines in `@rtb/platform-commerce`.

## Product states

`not_installed` → `requested` → `queued` → `provisioning` → `validating` → `active`

Lifecycle extensions:

- `active` ↔ `suspended`
- `active` → `upgrade_pending` → `upgrading` → `validating` → `active`
- `upgrading` → `failed` | `rollback_pending` → `rolling_back` → `active`
- `active` → `uninstall_pending` → `uninstalling` → `uninstalled`

## Application states

Same core flow with `awaiting_parent` for parent OS dependency.

## Server validation

All transitions are validated by `InstallationStateMachine` in the repository layer. Invalid transitions return HTTP 409.

## Events

Immutable events are recorded in `commercial_installation_events` with an immutability trigger.
