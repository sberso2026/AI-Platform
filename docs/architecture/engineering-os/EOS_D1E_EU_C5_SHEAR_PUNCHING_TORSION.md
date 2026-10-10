# EOS-D1E-EU-C5 — bounded Eurocode-profile RC shear / punching / torsion

Phase: EOS-D1E-EU-C5  
Parent: EOS-D1E-EU-C4 (PASS_WITH_LIMITATIONS)  
Mode: governed numerical implementation of the resolved bounded methods, with unresolved families left blocked  
Verdict: PASS_WITH_LIMITATIONS

This phase implemented two first-generation numerical methods whose minimum dependency sets are triangulated. It did not implement torsion. It did not pack recommended National Annex coefficients. Copyrighted standard text is not reproduced.

## Bounded scope by family

### Shear

Implemented method: `EU_RC_SHEAR_EN1992_WITHOUT_TRANSVERSE_REINFORCEMENT`.

Scope: members without design shear reinforcement, explicit zero axial force, explicit effective depth, web width, and longitudinal tension area, characteristic concrete strength, and declared `CRd,c` plus the recommended minimum-stress coefficient. Demand is D1C shear in newtons.

Out of scope: design shear reinforcement, strut/compression limitation, non-zero axial force, second-generation shear models.

### Punching

Implemented method: `EU_RC_PUNCHING_EN1992_INTERIOR_RECTANGULAR_CONCRETE`.

Scope: interior rectangular loaded area, basic control perimeter at an offset of two effective depths, explicit punching force, explicit beta, geometric-mean reinforcement ratio, and the same declared concrete-stress coefficients. Beam shear is not punching demand. D1C has no punching-action contract (`NOT_APPLICABLE`).

Out of scope: openings, edge and corner supports, calculated moment transfer, punching reinforcement, and the column-face maximum stress check.

### Torsion

None implementable. D1C torsion remains `NOT_IMPLEMENTED`. A complete standalone torsional resistance was not bound. Thin-wall geometry and V+T / M+T / N+M+V+T interaction are not implemented.

## Dependency rules

Shear, all implementation-ready:

- `EU_C5_SHEAR_RESISTANCE_WITHOUT_TRANSVERSE_REINFORCEMENT`
- `EU_C5_SHEAR_EFFECTIVE_GEOMETRY`
- `EU_C5_SHEAR_MINIMUM_RESISTANCE`
- `EU_C5_SHEAR_DECLARED_CRDC`

Punching, all implementation-ready:

- `EU_C5_PUNCHING_CONTROL_PERIMETER`
- `EU_C5_PUNCHING_CONCRETE_RESISTANCE`
- `EU_C5_PUNCHING_DECLARED_CRDC`
- `EU_C5_PUNCHING_DECLARED_VMIN`

Torsion, blocked:

- `EU_C5_TORSION_RESISTANCE`
- `EU_C5_TORSION_DEMAND`

## Evidence and profile identity

Sources are recorded with publisher, type, generation claim, and independence group:

- JRC Walraven workshop, 25 October 2011 (Tier A)
- SOFiSTiK EN 1992-1-1:2004 shear benchmark (independent software benchmark)
- InfoGraph punching help, recommended values separated from national modifications
- Concrete Centre lecture, 26 October 2017
- Markova, Holický, Jung, and Sýkora punching procedures

Claimed generation for the implemented expressions is first-generation. The pack edition remains `UNKNOWN_PENDING_CONFIRMATION`. A second-generation size-factor presentation is classified `BLOCKED_PROFILE_IDENTITY` and is not mixed in. A different national minimum-stress expression is `BLOCKED_NDP` and is not averaged or selected.

## NDP classification

`CRd,c` and the minimum-stress coefficient are `NDP_DEPENDENT` declared inputs. The size-factor depth numerator, size-factor cap, longitudinal-ratio cap, stress scale, and perimeter offset factor are `STANDARD_DEFINED`. No default National Annex. No location-inferred annex. No packed 0.18, 0.035, or 1.5.

## Geometry and demand

Shear `k` and `rho_l` are derived only from explicit depth, width, and tension area. Punching perimeter length is derived only for an interior rectangle. D1C shear demand is reused. No parallel demand engine was created.

## Combined actions

C2, C3, and C4 are reused and not reimplemented. No governed shear-torsion, flexure-torsion, or axial-torsion interaction method is implemented.

## Benchmarks

Expected values are independent hand expressions plus published anchors:

- Walraven beam example, reported 47.8 kN
- SOFiSTiK minimum-resistance example, reported 62.517 kN
- Walraven column B2 concrete punching stress, reported 0.67 MPa, perimeter reported 4060 mm

Live commercial software was not executed (`NOT_AVAILABLE`). Engineer validation remains pending. Numerical validation is not standard conformance.

## Conformance and product claim

`EU_CONCRETE_STANDARD_CONFORMANCE_STATE` remains `INTENDED_PROFILE`.  
`EU_CONCRETE_PACK_CERTIFIED` remains NO.  
Product claim remains `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`.

A satisfied shear or punching check is not member, flexural, detailing, durability, or professional approval.

## Next phase

Type: `TARGETED_C5_EVIDENCE_RECOVERY`  
Canonical next: `EOS-D1E-EU-C5-EVIDENCE`

Recover governed torsion resistance and a D1C torsional action. Do not advance to `EOS-D1E-EU-C6` while torsion, shear reinforcement, and the excluded punching cases remain unresolved.
