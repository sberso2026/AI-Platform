# EOS 2.20R GA Onboarding and Offboarding

`GA_ONBOARDING_WORKFLOW_IMPLEMENTED=YES`

`GA_OFFBOARDING_WORKFLOW_IMPLEMENTED=YES`

`GA_ONBOARDING_END_TO_END_TEST=PASS`

`GA_ONBOARDING_STATUS=READY`

Manual SQL is not the standard GA workflow. Authorized admin API + documented controlled commands are the path. Production EOS 2.20R validation used management SQL only for INTERNAL_GA_VALIDATION bootstrap under human GA authority; standard ops use APIs below.

## Onboarding (standard)

1. Create/select customer account (platform identity)
2. Create/select tenant
3. Create/select workspace
4. Assign EOS 2 product entitlement — `POST /api/engineering/eos2-ga-entitlement` `{ action: "grant", product implied eos-2, grantSource, reason }`
5. Establish product installation if required by platform commerce
6. Add authorized users (workspace memberships)
7. Assign workspace roles
8. Configure jurisdiction/region profile where applicable
9. Configure data-residency selection where supported
10. Enroll EOS 2 — `POST /api/engineering/eos2-enrollment` `{ enrolled: true, reason }` while tenant mode is `controlled_pilot` (or future GA rollout mode under separate activation)
11. Verify access via EOS 2 routes
12. Audit: `eos2_ga_entitlement_audit` + enrollment/delivery audit

## Offboarding

- Suspend entitlement — `{ action: "suspend" }` → EOS 2 denied; unrelated workspaces unaffected
- Revoke entitlement — `{ action: "revoke" }`
- Revoke user membership (platform membership admin)
- Disable EOS 2 enrollment — `{ enrolled: false }`
- Kill-switch / mode `off` for tenant-wide emergency
- Retain/audit data per policy; re-enable only under authority (`restore` / re-grant / re-enroll)

## End-to-end validation evidence (internal)

INTERNAL_GA_VALIDATION_B:

1. Workspace created and classified INTERNAL_GA_VALIDATION
2. Membership assigned
3. Entitlement granted (`INTERNAL_VALIDATION`)
4. Sequentially enrolled (cohort 1 → 2)
5. Basis validation record created in workspace B only
6. Suspend entitlement on B → status `suspended`; workspace A grant remained `active`
7. Restore B → `active`
8. Cross-project leak A↔B predicates = 0
9. Unrelated external user has 0 memberships on A/B
