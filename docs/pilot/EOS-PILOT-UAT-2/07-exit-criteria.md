# Pilot exit criteria — UAT-2

## Continue controlled Preview pilot when

- Founder can create and reopen project-scoped risks, TQs, decisions, actions, assets, and documents.
- Engineering AI answers stay on the selected project and do not leak other tenants.
- `/users` is treated as the directory behind Users & Permissions (not a second membership model).
- WSB-1RC is not presented as normal customer data.
- Seat pool remains 5/5; founder membership unchanged.
- Production is not promoted.

## Do not exit to Production while

- Project metadata PATCH is 403 on the live host (UAT-2-H1) unless formally deferred.
- Independent engineer and PM scripts have not been sat by humans.
- `PRODUCTION_GA_READY` is still false (always, for this ticket).

## Must not happen

- Production alias change
- Identity architecture change
- Commerce model / extra seats / extra products
- Deleting certification fixtures without a proven-safe plan
- Autonomous engineering approval
