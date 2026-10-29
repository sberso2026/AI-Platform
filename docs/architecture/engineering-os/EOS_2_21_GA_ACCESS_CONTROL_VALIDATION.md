# EOS 2.21 GA Access Control Validation

`GA_ACCESS_MODEL=EXPLICIT_ENTITLEMENT_AND_ENROLLMENT`

`LEGACY_ENTITLEMENT_AUTO_ENABLES_EOS_2=NO`

`LEGACY_PROJECT_AUTO_MIGRATION=NO`

`GA_ROLLOUT_ACCESS_MATRIX=PASS`

`POST_GA_ENTITLEMENT_ACCESS_MATRIX=PASS`

`GA_ENTITLEMENT_EVALUATOR=PASS`

`ENTITLEMENT_PRODUCT_FILTERING=PASS`

`GA_ENTITLEMENT_FAIL_CLOSED=PASS`

## Access matrix (post-activation)

| Case | Result |
| --- | --- |
| Unauthenticated | DENY |
| Unentitled tenant / workspace | DENY |
| Entitled, not enrolled | DENY |
| Legacy engineering-os entitlement only | DENY |
| Wrong product | DENY |
| Wrong workspace | DENY |
| Revoked entitlement | DENY |
| Suspended entitlement | DENY |
| Explicitly entitled + enrolled under `general_availability` | ALLOW |
| Kill switch `off` | DENY (entitlements/enrollment preserved) |

Evidence: unit matrices (`eos2-rollout`, `eos2-ga-entitlement`, `eos2-external-customer-hold`) + Production mode/enrollment/grant probes after activation.

## Existing enrolled workspaces

| Workspace | Classification | Entitlement | Enrolled |
| --- | --- | --- | --- |
| `5c85d773-3b79-43b2-b138-c6251f566768` | controlled_pilot / GA validation | active | yes |
| `ce113edd-45b8-4efd-b2e0-0ad0307c611c` | INTERNAL_GA_VALIDATION | active | yes |

`EOS_2_PRODUCTION_ENROLLED_WORKSPACE_COUNT_AFTER_ACTIVATION=2`

`UNAPPROVED_EOS_2_ENROLLED_WORKSPACE_COUNT=0`

`EXISTING_GA_VALIDATION_WORKSPACES_OPERATIONAL=PASS` (projects/basis sets present; grants active; enrollment retained through kill-switch cycle)

## Isolation / authority

`POST_GA_MULTI_WORKSPACE_RLS_VALIDATION=PASS`

`CROSS_WORKSPACE_PRODUCTION_LEAK_COUNT=0`

`AI_CROSS_WORKSPACE_LEAK_COUNT=0`

`POST_GA_AUTHORITY_BOUNDARY_TEST=PASS` (roles remain workspace/tenant membership scoped; GA mode does not broaden authority)
