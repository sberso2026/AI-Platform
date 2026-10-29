# EOS 3.11R Production Access and RLS Evidence

## Cohort

`EOS_3_PRODUCTION_ENABLED_WORKSPACE_COUNT=1`

Workspace: `5c85d773-3b79-43b2-b138-c6251f566768` (eos-controlled-pilot / Default Workspace)

`EOS_3_UNAPPROVED_PRODUCTION_WORKSPACE_COUNT=0`

## Entitlement / enrollment

`EOS_3_PILOT_ENTITLEMENT_GRANTED=YES` (product_key=eos-3, INTERNAL_VALIDATION)

`EOS_3_PILOT_ENROLLMENT_CREATED=YES` (state=PILOT)

`EOS_2_ENTITLEMENT_AUTO_ENABLES_EOS_3=NO`

## Access matrix (evaluator)

| Caller | Result |
|--------|--------|
| PILOT + entitled + Production | ALLOW (`active_controlled_pilot`) |
| DEVELOPMENT + entitled + Production | DENY (`production_denied`) |
| missing entitlement + Production | DENY |
| kill switch | DENY |
| EOS 2 product key | DENY (wrong_product) |

## RLS / isolation

Pilot smoke objects exist only in authorized workspace.

`EOS_3_PRODUCTION_CROSS_WORKSPACE_LEAK_COUNT=0` (foreign workspace probe for smoke project = 0)
