# EOS-D1B Structural Standard Binding

Governed binding between Structural calculations and jurisdiction, standard family/code, edition, amendment, National Annex, effective period, deterministic tool, tool version, and calculation method. Binding, resolution, validation, and provenance only. No design-code formulas, load-combination engines, SPACE GASS execution, solvers, or optimization.

Package decision: contracts in `@rtb/types` `structural-standard-binding.ts`; resolution/guards in `@rtb/engineering-os` `src/structural-domain/binding.ts`. Reuses EOS-EU-0 `JurisdictionProfile`, engineering standards records, global provenance, discipline governance, and AI governance. No parallel Structural jurisdiction framework. No persistence migration.

Structural maturity remains `REFERENCE_PARTIALLY_IMPLEMENTED`.

## Binding model

Canonical contract: `StructuralStandardContext`.

| Field | Role |
|---|---|
| contextId | Stable identifier for this bound context |
| jurisdictionProfileRef | Explicit EOS-EU-0 jurisdiction profile |
| standardFamily / standardCode | Selected family and code |
| edition / amendment | Edition required for governed calculations; amendment preserved |
| nationalAnnexRef | Conditional EU/EEA Eurocode annex metadata |
| effectiveFrom / effectiveTo | Applicability window |
| discipline / materialScope / calculationScope | Scope of the bind |
| sourceReference | Metadata/reference only; not copyrighted standard text |
| approvalStatus / validationState / lifecycle | Governance and lifecycle |
| provenanceRef | `EosGlobalProvenanceContract` |

Every governed calculation result (`StructuralGovernedCalculationBinding`) is traceable to: jurisdiction profile, standard context, tool, tool version, calculation method, input evidence, and provenance. Ambiguous standard context is forbidden.

`StructuralStandardContextRef` on D1A objects remains a lightweight pointer. Canonical governed bind is `StructuralStandardContext`. Work-generator `StructuralDesignStandard` carries the same context; identifier/editionYear remain display fields. There is not a second competing standards model.

## Jurisdiction model

Governed calculations require an explicit jurisdiction profile resolved from governed project/workspace context or selected by an authorized user.

Forbidden: `null`, `unknown`, and silent inference from user locale.

Project/workspace defaults (`StructuralProjectStandardDefaults`) may suggest a default jurisdiction and standards profile. Defaults cannot create a governed calculation by themselves. An explicit calculation bind overrides defaults.

## Standard lifecycle

`ACTIVE` | `SUPERSEDED` | `WITHDRAWN` | `FUTURE` | `CUSTOMER_APPROVED_LEGACY`.

Historical issued calculations keep their original context even if the standard is later superseded. New governed calculations against superseded or withdrawn standards fail closed unless policy is explicitly `CUSTOMER_APPROVED_LEGACY`.

## Edition and amendment

Governed calculations require `standardCode` and `edition`. Amendment is nullable metadata and is preserved on the context. Issued calculations are not silently moved to a newer amendment or edition.

Editions are not hard-coded as a global current-year default.

## National Annex

`StructuralNationalAnnexRef` is an EU/EEA Eurocode capability, not a mandatory global field.

- Required when the context is a Eurocode family/code **and** jurisdiction is `eu-eea`.
- Optional when a National Annex is not applicable.
- Rejected when attached to a non-EU/EEA context (for example AU AS 4100 or US AISC 360).
- Annex jurisdiction, standard code, and edition must match the calculation context.

Parameter values are not populated in D1B. `StructuralJurisdictionParameterSet` declares architecture keys (partial factors, combination factors, material factors, reliability parameters, nationally determined values) with `hardcodedIntoGenericEngine = false`.

## Standard packs

All packs are `FRAMEWORK_ONLY`. No formulas.

| Pack | Jurisdiction | Declared codes |
|---|---|---|
| AU | australia | AS/NZS 1170, AS 4100, AS 3600 |
| EU | eu-eea | EN 1990, EN 1991, EN 1992, EN 1993, EN 1998 |
| US | united-states | ASCE 7, AISC 360, ACI 318 |
| UK / CA / ME / APAC / OTHER | matching EU-0 profiles | extensible empty declarations |

Australia / US / other jurisdictions do not carry National Annex as required data.

## Tool scope and certification

A deterministic tool declares `supportedStandardCodes`, `supportedEditions`, `supportedJurisdictions`, `supportedCalculationTypes`, `validationState`, `certificationState`, and `designCodeCertified`.

Unsupported scope fails closed. Software availability is not certification.

Certification states: `UNVALIDATED` | `IMPLEMENTED` | `BENCHMARKED` | `HUMAN_VALIDATED` | `PILOT` | `CERTIFIED` | `NOT_CERTIFIED`.

### Synthetic UDL engine

`EOS_STRUCTURAL_DETERMINISTIC_V1` / `SYNTHETIC_SS_BEAM_UDL_STATICS` (`V = wL/2`, `M = wL²/8`) is a jurisdiction-neutral statics demonstration method. It is bound to `SYNTHETIC_STATICS` / `global-baseline`. It is **not** a design-code capacity engine and is **not** certified to AS, EN, AISC, or ACI.

## Configured knowledge versus engines

Discipline Intelligence catalog rows for AS 4100, AS/NZS 1170, and AS 3600 remain `CONFIGURED` with `edition = null`, `engineState = NOT_IMPLEMENTED`, `certificationState = NOT_CERTIFIED`.

Configured standard knowledge ≠ implemented calculation engine ≠ certified design capability.

Work-generator crusher fixture standards now carry a `StructuralStandardContext` while remaining `NOT_IMPLEMENTED` / `NOT_CERTIFIED`.

## Immutability

Once a governed calculation is issued, later changes to project default jurisdiction, standard, edition, or annex do not mutate the stored context. `snapshotIssuedContext` returns the original bind.

## Multi-standard projects

A project may bind different standard families on different deliverables (for example structural steel AS 4100, concrete ACI 318, synthetic statics demonstration). One standard family per tenant is not assumed.

## Conflict detection

Fail closed when:

- jurisdiction is missing, unknown, or locale-inferred
- standard code or edition is missing on a governed calculation
- National Annex is required and absent, or present where not applicable
- annex jurisdiction/code/edition disagrees with the calculation
- tool does not support the selected standard, edition, jurisdiction, or calculation type
- context is outside its effective period
- new work uses a superseded/withdrawn standard without explicit legacy policy
- calculation scope is outside tool certification (design-code types on the synthetic UDL engine)

## AI boundary

AI may suggest a likely standard context (`StructuralStandardAiSuggestion`: model/tool, source, confidence, human confirmation). AI selection is advisory only. AI must not silently choose or switch standards. AI interpretation is not authoritative standard text. Human confirmation is required where professional judgment selects the applicable standard. Professional authority titles remain jurisdiction profiles (`roleKey`), not hard-coded global titles.

## Copyright / licensing boundary

EOS references standards and validated calculation-rule metadata. It does not embed copyrighted engineering standard text. `sourceReference` is a pointer, not a reproduction.

## Security / privacy

Standards metadata does not introduce personal data. Tenant isolation and workspace isolation are preserved on project defaults and object identity. Least privilege and auditability inherit from the global security baseline.

## D0 risk disposition (D1B)

| Disposition | IDs |
|---|---|
| CLOSED | D0-R02, D0-R06 |
| REDUCED | D0-R03, D0-R05, D0-R07, D0-R08 |
| UNCHANGED | D0-R01, D0-R04, D0-R09, D0-R10, D0-R11, D0-R12 |

## D1C / D1D / D1E / D1G dependencies

D1B must precede governed D1C/D1D/D1E calculations.

- **D1C** loads/combinations consume a bound `StructuralStandardContext`. Combination factors come from bound parameter sets or human-entered governed values, never silent national defaults.
- **D1D** steel adapters fail closed unless jurisdiction, code, edition, amendment, and annex (when applicable) are bound. No generic AS 4100 / EN 1993 / AISC formula file.
- **D1E** concrete adapters fail closed on the same bind invariant for AS 3600 / EN 1992 / ACI 318.
- **D1G** external solvers declare supported standards/jurisdictions and certification state; uncertified or out-of-scope execution fails closed.

Closed D1 gaps: `NO_STANDARD_EDITION_ANNEX_BINDING_ON_CALCULATIONS`, `DETERMINISTIC_TOOL_JURISDICTION_UNBOUND`. Remaining Structural gaps (SPACE GASS, design-code engines, optimization certification) are unchanged.

## Pilot

Profile A is unchanged. D1B does not enable new design checks, new standards engines, SPACE GASS, returned uploads, or SharePoint write.
