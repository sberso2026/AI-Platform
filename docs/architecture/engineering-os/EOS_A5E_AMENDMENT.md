# EOS-A5E Amendment — External Tool & Integration Governance

Amendment to EOS-A5E (which remains FAIL for AAL2, browser, and live SPACE GASS execution).
This change does **not** recertify those missing prerequisites and does **not** implement EOS-A6.

| Field | Value |
| --- | --- |
| Parent A5E HEAD | `8977b6a45bc5a98cbc00f55d1d15cd0005907e5a` |
| Branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Route | `/engineering/settings/external-tools` |
| SPACE GASS readiness | `NOT_CONFIGURED` |
| False solver certification | NO |

## What was implemented

Generic External Tool governance under Engineering OS Settings:

- Catalog of categories and integration modes (not vendor-hardcoded)
- Platform tool profiles vs workspace assignments
- Licence + explicit automation permission with provenance fields
- Secret-value exclusion; secret **references** only
- Adapter compatibility ranges and fail-closed mismatch
- Capability-level certification on the profile (reuses EMI identity for SPACE GASS adapter; does not fork `capabilities` table)
- Derived readiness
- Mode-aware validation actions
- Settings list + detail UI
- Optimization blocks real (non-stub) solver runs unless a READY assigned profile with certified `OPTIMIZATION_EXECUTION` is supplied
- Manifest v1 additive `execution.external_tool` (revision 1.1)

## SPACE GASS initial profile

Overlay id `catalog:spacegass` until persisted. Values match EOS-A5E evidence:

- executable NOT_CONFIGURED
- version UNKNOWN
- licence UNAVAILABLE
- automation REQUIRES_CONFIRMATION
- adapter `spacegass_solver_adapter` / `0.3.0-spacegass`
- no capability marked CERTIFIED
- readiness NOT_CONFIGURED

Persisting the profile does not fabricate installation or mark READY.

## Persistence

Migration `supabase/migrations/20260929240000_eos_a5e_external_tool_governance.sql`

- `engineering_external_tool_profiles` — tenant, admin mutate
- `engineering_external_tool_assignments` — workspace authorization, admin mutate

Ordinary execute users may read tenant profiles; they cannot change executable, licence, automation, or certification.

## Out of scope (preserved)

No SPACE GASS install, no fabricated licence/version/automation, no structural optimization, no Value Intelligence, no second queue/host/graph, no MFA weaken, no commerce bypass.
