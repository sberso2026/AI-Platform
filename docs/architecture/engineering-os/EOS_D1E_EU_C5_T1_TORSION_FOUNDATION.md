# EOS-D1E-EU-C5-T1 — torsion foundation and authority recovery

This phase adds a generic D1C transport for an externally supplied member torsion and records a final deferral of numerical torsion resistance. Shear and interior punching methods are unchanged. No torsional analysis and no FEA were added.

## D1C action transport

Analytical torsion remains `NOT_IMPLEMENTED`. The demand engine still does not compute torsion from loads, eccentricity, stiffness, or a model, and it does not report a missing torsion as zero.

When a caller supplies an explicit action, the engine validates and attaches it:

| Field | Value |
| --- | --- |
| Action id | `MEMBER_TORSION` |
| Type | `EXPLICIT_GOVERNED_ACTION` |
| Stored unit | `N.m` (`kN.m` is accepted and converted) |
| Axis | `MEMBER_X` |
| Sign | right-hand rule about member x, thumb toward increasing x |

The combination id must match the demand combination. The evidence id must already be in the demand evidence set. The fingerprint is taken on the canonical `N.m` value, so `1 kN.m` and `1000 N.m` fingerprint together. Missing values, non-finite values, other units, other axes, and missing provenance fail closed.

The action is not Eurocode-specific.

## Rule recovery

Profile under audit: first-generation EN 1992-1-1. Edition and amendment remain `UNKNOWN_PENDING_CONFIRMATION`. No second-generation expression was mixed in. No National Annex was inferred from a location, and no annex value was guessed.

Source groups:

| Group | Source | What it supports |
| --- | --- | --- |
| A | J.C. Walraven, Eurocode concrete slides, 2 February 2008 (eurocodes.fi) | Thin-wall thickness as area over outer perimeter; shear flow from torsional demand and the centre-line enclosed area; wall reinforcement designed by the variable-angle truss with a recommended cotangent range of 1 to 2.5 |
| B | Karlsruhe Institute of Technology, MSc concrete-design summary | Same algebraic strut-resistance form, but with German-course values: a different cotangent range, a fixed strength-reduction number, a squared shear-torsion interaction for solid sections, and a cracking check written against shear |

Those groups are independent. They do not agree on a single profile, so the independence result for a numerical resistance method is `FAIL`.

| Parameter | Classification |
| --- | --- |
| Effective thickness `A/u` and centre-line area | standard-described geometry; not promoted to a resistance method |
| Shear flow | `ESTABLISHED_ENGINEERING_MECHANICS` as used by the Walraven torsion procedure; not a resistance |
| Strut angle | designer-selected inside bounds that are national-profile dependent |
| Strength-reduction factor and axial concrete factor | `NDP_DEPENDENT` |
| Design concrete strength | `NDP_DEPENDENT` and `MATERIAL_SPECIFIC` |
| Transverse and longitudinal torsion reinforcement | unresolved; the two source groups do not place the angle function the same way |
| Cracking / threshold | requires simultaneous shear in the KIT summary; not used as a standalone rule |

Cracking disposition: `REQUIRES_SHEAR_INTERACTION`.

Maximum-resistance disposition: not implementation-ready. The only retrieved statement of the strut torsional resistance sits in the German-course note and is tied to that note's strength-reduction value and interaction form. Required parameters, if a later profile-specific method is authorized: strength-reduction factor, axial concrete factor, design concrete strength, strut angle, enclosed area, and effective thickness. NDP dependency: yes. Authority: incomplete.

Reinforcement disposition: `BLOCKED_SOURCE_CONFLICT`.

Geometry disposition: identities are described by the Walraven slides and are not coded. No geometry number was guessed.

Selected bounded method that would have been the smallest useful check: solid rectangle, explicit transported torsion, explicit thickness and enclosed area, declared strut angle inside declared bounds, declared strength factors, zero shear, no reinforcement design. It was not authorized, because the strength factor and the angle bounds are not one profile, and coding them from the German-course note would mix that profile into the intended base method.

`EU_C5_T1_IMPLEMENTATION_AUTHORIZED = NO`.

Final disposition: `DEFERRED_PROFILE_OR_NDP_UNRESOLVED`.

## Conformance and roadmap

Numerical work was not treated as conformance. The pack stays uncertified. The product claim stays `EU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY`.

`D1E-EU-VD-TORSION` stays `UNRESOLVED`. The C5 architecture note already says not to open second-order RC work while torsion is unresolved, and the conformance plan still lists torsion inside C5 before C6. Closeout with torsion deferred is not allowed. C6 is the next roadmap item and it is blocked until one explicit national profile is bound for the strut-angle limits, the strength-reduction factor, and the shear-torsion interaction form. This phase does not open another generic evidence loop and does not start C6.
