# EOS 3 Post-GA Release Governance

`EOS_3_POST_GA_RELEASE_WORKFLOW_DEFINED=YES`  
`EOS_3_POST_GA_SECURITY_GATE_MANDATORY=YES`  
`EOS_3_CAPABILITY_TRACK_HUMAN_AUTHORITY=PASS`

## Mandatory workflow (every post-GA Production-affecting change)

1. **Issue** — recorded defect, risk, or approved capability-track work item  
2. **Classification** — one of the canonical post-GA change classes  
3. **Impact assessment** — product, access, security, operations  
4. **Security review** — RLS, entitlement, secrets, dependency posture  
5. **Qualification impact** — required for semantic/qualification/AI/connector/solver/migration classes  
6. **Implementation** — scoped to approved track; no silent claim expansion  
7. **Staging validation** — fail-closed evidence  
8. **Release regression** — current release suite + Security + Release Regression Gate  
9. **Human authorization** — designated human GO for Production-affecting enablement  
10. **Production rollout** — controlled deploy / enrollment as authorized  
11. **Post-release verification** — smoke, access, audit/provenance checks  

Every Production-affecting track/release must end with:

`SECURITY_RELEASE_REGRESSION_GATE=PASS`

## Human vs AI authority

| Actor | May | May not |
|-------|-----|---------|
| AI | Identify tracks; summarize evidence; propose priority; draft plans; identify dependencies | Authorize enablement; broaden qualification; approve Production rollout; approve external customer release; change GA claims |
| Human | Authorize tracks, Production changes, claim updates, external release | — |

## External customer release

Remains a **separate** gate from technical maintenance and capability tracks.

`EOS_3_EXTERNAL_CUSTOMER_RELEASE_AUTHORIZED=NO`  
`EOS_3_EXTERNAL_CUSTOMER_HOLD=ACTIVE`  
`EOS_3_EXTERNAL_CUSTOMER_RELEASE_GATE_SEPARATE=YES`
