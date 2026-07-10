# Workspace Provisioning

Workspace product assignments link installations to workspaces via `commercial_workspace_product_assignments`.

## Enforcement

When assignments exist for an installation, entitlement checks require the requesting workspace to have an active assignment.

## API

- `GET/POST /api/platform/workspace-product-assignments`

Assignment removal immediately invalidates entitlement cache and bumps `commercial_installation_versions`.

## Application workspace scope

`commercial_workspace_application_assignments` scopes application installations to selected workspaces when `workspace_scope = selected`.
