# EOS-COMMERCE-APP-1 live validation

Authenticated founder session on current Engineering OS Preview.

## Required checks

Engineering Systems matrix vs route access:

| Application | Expected after reconcile | Open |
|---|---|---|
| Asset Intelligence | Installed or Available matching Commerce | must not hit application_not_in_plan |
| Digital Twin | Installed or Available matching Commerce | must not hit application_not_in_plan |
| Engineering Models | Installed or Available matching Commerce | must not hit application_not_in_plan |
| Project Controls | Installed / Open | application reachable |
| Project Intelligence | Installed / Open | application reachable |
| Inspection Intelligence | Installed / Open | application reachable |

Subscriptions:

- Product column shows Engineering OS, not `c1000000`
- Plan name visible
- Trialing/Active
- Trial end as a local date
- Licence state
- Seat usage when a pool exists
- Installed applications
- Internal IDs only under Details

## Capture

Authenticated screenshots belong in `screenshots/`:

- Engineering Systems after reconciliation
- Subscriptions after reconciliation

Browser SSO blocked unattended capture. Founder must confirm the Preview session after deploy.

Until founder review:

`FOUNDER_ACCEPTANCE_REQUIRED=true`
`PRODUCT_EXTERNAL_UAT_READY=false`
`PRODUCTION_GA_READY=false`
